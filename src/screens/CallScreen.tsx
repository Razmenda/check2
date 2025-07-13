import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Volume2,
  VolumeX,
  MoreVertical,
  Users,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Call {
  id: number;
  type: 'audio' | 'video';
  status: string;
  participants: number[];
  initiator: {
    id: number;
    username: string;
    avatar?: string;
  };
  Chat: {
    id: number;
    name?: string;
    isGroup: boolean;
  };
}

interface Participant {
  id: number;
  username: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const CallScreen: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [call, setCall] = useState<Call | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [showParticipants, setShowParticipants] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const callStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // Fetch call details
  useEffect(() => {
    const fetchCall = async () => {
      if (!callId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/calls/${callId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCall(response.data);
        
        // Initialize participants
        const callParticipants: Participant[] = response.data.participants.map((id: number) => ({
          id,
          username: id === response.data.initiator.id ? response.data.initiator.username : `User ${id}`,
          avatar: id === response.data.initiator.id ? response.data.initiator.avatar : undefined,
          isMuted: false,
          isVideoOff: false
        }));
        
        setParticipants(callParticipants);
        
        if (response.data.status === 'pending') {
          setCallStatus('ringing');
        } else if (response.data.status === 'ongoing') {
          setCallStatus('connected');
          startCallTimer();
        }
      } catch (error) {
        console.error('Error fetching call:', error);
        toast.error('Call not found');
        navigate('/chats');
      }
    };

    fetchCall();
  }, [callId, navigate]);

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      if (!call) return;

      try {
        const constraints = {
          audio: true,
          video: call.type === 'video'
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;

        if (localVideoRef.current && call.type === 'video') {
          localVideoRef.current.srcObject = stream;
        }

        setCallStatus('connected');
        startCallTimer();

        // Initialize WebRTC connections for each participant
        participants.forEach(participant => {
          if (participant.id !== user?.id) {
            initializePeerConnection(participant.id, stream);
          }
        });

      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera/microphone');
      }
    };

    if (call && participants.length > 0) {
      initializeMedia();
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peerConnectionsRef.current.forEach(pc => pc.close());
    };
  }, [call, participants]);

  // Socket event listeners for WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    const handleWebRTCOffer = async (data: any) => {
      const { offer, fromUserId } = data;
      const peerConnection = peerConnectionsRef.current.get(fromUserId);
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('webrtc_answer', {
          targetUserId: fromUserId,
          answer,
          callId
        });
      }
    };

    const handleWebRTCAnswer = async (data: any) => {
      const { answer, fromUserId } = data;
      const peerConnection = peerConnectionsRef.current.get(fromUserId);
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleWebRTCIceCandidate = async (data: any) => {
      const { candidate, fromUserId } = data;
      const peerConnection = peerConnectionsRef.current.get(fromUserId);
      
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleCallEnded = () => {
      setCallStatus('ended');
      endCall();
    };

    socket.on('webrtc_offer', handleWebRTCOffer);
    socket.on('webrtc_answer', handleWebRTCAnswer);
    socket.on('webrtc_ice_candidate', handleWebRTCIceCandidate);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('webrtc_offer', handleWebRTCOffer);
      socket.off('webrtc_answer', handleWebRTCAnswer);
      socket.off('webrtc_ice_candidate', handleWebRTCIceCandidate);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, callId]);

  const initializePeerConnection = async (participantId: number, localStream: MediaStream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      
      // Update participant with stream
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, stream: remoteStream } : p
      ));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_ice_candidate', {
          targetUserId: participantId,
          candidate: event.candidate,
          callId
        });
      }
    };

    peerConnectionsRef.current.set(participantId, peerConnection);

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    if (socket) {
      socket.emit('webrtc_offer', {
        targetUserId: participantId,
        offer,
        callId
      });
    }
  };

  const startCallTimer = () => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        
        // Update participant state
        setParticipants(prev => prev.map(p => 
          p.id === user?.id ? { ...p, isMuted: !isMuted } : p
        ));
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && call?.type === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
        
        // Update participant state
        setParticipants(prev => prev.map(p => 
          p.id === user?.id ? { ...p, isVideoOff: !isVideoOff } : p
        ));
      }
    }
  };

  const endCall = async () => {
    try {
      if (callId) {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/api/calls/${callId}`, {
          status: 'ended',
          endedAt: new Date().toISOString(),
          duration: callDuration
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Emit call end via socket
        if (socket) {
          socket.emit('call_end', { callId });
        }
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }

    // Stop call timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());

    setCallStatus('ended');
    toast.success('Call ended');
    navigate('/chats');
  };

  const openChat = () => {
    if (call?.Chat.id) {
      navigate(`/chats/${call.Chat.id}`);
    }
  };

  if (!call) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const isVideoCall = call.type === 'video';
  const otherParticipants = participants.filter(p => p.id !== user?.id);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Video Background */}
      {isVideoCall && (
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}

      {/* Audio Call Background */}
      {!isVideoCall && (
        <div className="absolute inset-0 bg-gradient-primary">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6">
                {call.initiator.avatar ? (
                  <img src={call.initiator.avatar} alt={call.initiator.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">
                      {call.initiator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-12">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold mb-1">
            {call.Chat.isGroup ? call.Chat.name || 'Group Call' : call.initiator.username}
          </h1>
          <p className="text-lg text-white/80">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'ringing' && 'Ringing...'}
            {callStatus === 'connected' && formatDuration(callDuration)}
          </p>
          {call.Chat.isGroup && (
            <p className="text-sm text-white/60 mt-1">
              {participants.length} participants
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {call.Chat.isGroup && (
            <button 
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Users className="h-6 w-6" />
            </button>
          )}
          <button 
            onClick={openChat}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Participants Grid for Group Calls */}
      {call.Chat.isGroup && isVideoCall && (
        <div className="absolute inset-x-4 top-32 bottom-32 z-10">
          <div className="grid grid-cols-2 gap-4 h-full">
            {participants.slice(0, 4).map((participant) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-2xl overflow-hidden">
                {participant.stream && !participant.isVideoOff ? (
                  <video
                    autoPlay
                    playsInline
                    muted={participant.id === user?.id}
                    className="w-full h-full object-cover"
                    ref={participant.id === user?.id ? localVideoRef : undefined}
                    srcObject={participant.id === user?.id ? localStreamRef.current : participant.stream}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {participant.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Participant Info */}
                <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-1">
                  <span className="text-white text-sm">{participant.username}</span>
                  {participant.isMuted && (
                    <MicOff className="h-3 w-3 text-red-400 ml-1 inline" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Video (Picture-in-Picture) for 1-on-1 calls */}
      {isVideoCall && !call.Chat.isGroup && (
        <div className="absolute top-20 right-4 z-20 w-32 h-48 bg-gray-800 rounded-2xl overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participants List */}
      {showParticipants && (
        <div className="absolute right-4 top-32 bottom-32 w-64 bg-black/80 backdrop-blur-sm rounded-2xl p-4 z-20">
          <h3 className="text-lg font-semibold mb-4">Participants ({participants.length})</h3>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {participant.avatar ? (
                    <img src={participant.avatar} alt={participant.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {participant.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{participant.username}</p>
                  <div className="flex items-center space-x-2">
                    {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
                    {participant.isVideoOff && <VideoOff className="h-3 w-3 text-red-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="flex items-center justify-center space-x-6">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {/* Video toggle (only for video calls) */}
          {isVideoCall && (
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                isVideoOff 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </button>
          )}

          {/* Speaker toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isSpeakerOn 
                ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>

          {/* End call button */}
          <button
            onClick={endCall}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <PhoneOff className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;