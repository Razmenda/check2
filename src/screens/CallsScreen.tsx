import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, MoreVertical, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import BottomNavigation from '../components/BottomNavigation';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

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
  Chat: {
    id: number;
    name?: string;
    isGroup: boolean;
  };
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
}

interface CallStats {
  totalCalls: number;
  missedCalls: number;
  totalDuration: number;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const CallsScreen: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [callStats, setCallStats] = useState<CallStats>({ totalCalls: 0, missedCalls: 0, totalDuration: 0 });
  const [activeTab, setActiveTab] = useState('calls');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCalls();
    fetchCallStats();
  }, []);

  const fetchCalls = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/calls`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCalls(response.data);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast.error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const fetchCallStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/calls/stats/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCallStats(response.data);
    } catch (error) {
      console.error('Error fetching call stats:', error);
    }
  };

  const filteredCalls = calls.filter(call => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return call.initiator.username.toLowerCase().includes(searchLower) ||
           (call.Chat.name && call.Chat.name.toLowerCase().includes(searchLower));
  });

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
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds: number) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const handleCallBack = async (call: Call) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/calls`, {
        chatId: call.Chat.id,
        type: call.type
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate(`/call/${response.data.id}`);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to start call');
    }
  };

  const handleSearch = () => {
    // Implement search functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        title="Calls"
        showSearch
        onSearchClick={handleSearch}
        rightActions={[
          {
            icon: MoreVertical,
            onClick: () => {}
          }
        ]}
      />

      <div className="pt-16 pb-24">
        {/* Search Bar */}
        <div className="px-4 py-4 bg-white shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calls..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Call Statistics */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{callStats.totalCalls}</p>
              <p className="text-sm text-gray-600">Total Calls</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                <PhoneMissed className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{callStats.missedCalls}</p>
              <p className="text-sm text-gray-600">Missed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatTotalDuration(callStats.totalDuration)}</p>
              <p className="text-sm text-gray-600">Total Time</p>
            </div>
          </div>
        </div>

        {/* Calls List */}
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Phone className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No calls found' : 'No recent calls'}
            </h3>
            <p className="text-sm text-center">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Your call history will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCalls.map((call) => (
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
                    <h3 className="font-semibold text-gray-900 ml-2">
                      {call.Chat.isGroup ? call.Chat.name || 'Group Call' : call.initiator.username}
                    </h3>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}</span>
                    {call.duration && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(call.duration)}</span>
                      </>
                    )}
                    {call.Chat.isGroup && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Group</span>
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
                  className="p-2 text-primary-500 hover:bg-primary-100 rounded-full transition-colors duration-200"
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