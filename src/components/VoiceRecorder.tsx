import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Play, Pause } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSend = () => {
    if (audioBlob && duration > 0) {
      onSend(audioBlob, duration);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Message</h3>
          <div className="text-2xl font-mono text-primary-800">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="flex items-center justify-center h-16 mb-6 bg-gray-50 rounded-xl">
          <div className="flex items-end space-x-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-primary-800 rounded-full transition-all duration-150 ${
                  isRecording && !isPaused ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  opacity: isRecording && !isPaused ? Math.random() * 0.5 + 0.5 : 0.3
                }}
              />
            ))}
          </div>
        </div>

        {/* Audio Player (when recorded) */}
        {audioUrl && (
          <div className="mb-6">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="w-12 h-12 bg-primary-800 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors duration-200"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </button>
              <div className="text-sm text-gray-600">
                Tap to preview your voice message
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!audioBlob ? (
            <>
              {/* Cancel */}
              <button
                onClick={handleCancel}
                className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
              >
                <Trash2 className="h-6 w-6" />
              </button>

              {/* Record/Pause/Resume */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 bg-primary-800 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Mic className="h-8 w-8" />
                </button>
              ) : (
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-200"
                >
                  {isPaused ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
                </button>
              )}

              {/* Stop */}
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="w-12 h-12 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </button>
              )}
            </>
          ) : (
            <>
              {/* Cancel */}
              <button
                onClick={handleCancel}
                className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
              >
                <Trash2 className="h-6 w-6" />
              </button>

              {/* Send */}
              <button
                onClick={handleSend}
                className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
              >
                <Send className="h-8 w-8" />
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {!isRecording && !audioBlob && "Tap to start recording"}
          {isRecording && !isPaused && "Recording... Tap to pause"}
          {isRecording && isPaused && "Paused. Tap to resume"}
          {audioBlob && "Tap send to share your voice message"}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;