import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import BottomNavigation from '../components/BottomNavigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

interface Call {
  id: number;
  type: 'audio' | 'video';
  status: 'pending' | 'ongoing' | 'ended' | 'missed';
  participants: number[];
  initiator: {
    id: number;
    username: string;
    avatar?: string;
  };
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const CallsScreen: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeTab, setActiveTab] = useState('calls');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // For now, we'll show empty state since we don't have a calls history endpoint
        setCalls([]);
      } catch (error) {
        console.error('Error fetching calls:', error);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  const getCallIcon = (call: Call) => {
    if (call.status === 'missed') {
      return <PhoneMissed className="h-5 w-5 text-red-500" />;
    } else if (call.initiator.id !== user?.id) {
      return <PhoneIncoming className="h-5 w-5 text-green-500" />;
    } else {
      return <PhoneOutgoing className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallBack = async (call: Call) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/calls`, {
        chatId: 1, // This would be the actual chat ID
        type: call.type
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate(`/call/${response.data.id}`);
    } catch (error) {
      console.error('Error initiating call:', error);
      // Fallback to mock call
      navigate(`/call/${Date.now()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        title="Calls"
        showSearch
        onSearchClick={() => {}}
        rightActions={[
          {
            icon: MoreVertical,
            onClick: () => {}
          }
        ]}
      />

      <div className="pt-16 pb-24">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Phone className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No recent calls</h3>
            <p className="text-sm text-center">
              Your call history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center px-4 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleCallBack(call)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  {call.initiator.avatar ? (
                    <img src={call.initiator.avatar} alt={call.initiator.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {call.initiator.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Call Info */}
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {getCallIcon(call)}
                    <h3 className="font-semibold text-gray-900 ml-2">{call.initiator.username}</h3>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}</span>
                    {call.duration && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(call.duration)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Call Type Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallBack(call);
                  }}
                  className="p-2 text-primary-800 hover:bg-primary-100 rounded-full transition-colors duration-200"
                >
                  {call.type === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default CallsScreen;