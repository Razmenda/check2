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
  MoreVertical
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

const API_BASE_URL = '';

const CallScreen: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [call, setCall] = useState<Call | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
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
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera/microphone');
      }
    };

    if (call) {
      initializeMedia();
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [call]);

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
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current && call?.type === 'video') {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
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

    setCallStatus('ended');
    toast.success('Call ended');
    navigate('/chats');
  };

  if (!call) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const isVideoCall = call.type === 'video';

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
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
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
          <h1 className="text-2xl font-bold mb-1">{call.initiator.username}</h1>
          <p className="text-lg text-white/80">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'ringing' && 'Ringing...'}
            {callStatus === 'connected' && formatDuration(callDuration)}
          </p>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200">
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {isVideoCall && (
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