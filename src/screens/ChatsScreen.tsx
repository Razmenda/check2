import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import ChatItem from '../components/ChatItem';
import StoryCarousel from '../components/StoryCarousel';
import StoryViewer from '../components/StoryViewer';
import CreateStoryModal from '../components/CreateStoryModal';
import BottomNavigation from '../components/BottomNavigation';
import NewChatModal from '../components/NewChatModal';
import axios from 'axios';

interface Chat {
  id: number;
  name?: string;
  isGroup: boolean;
  participants: Array<{
    id: number;
    username: string;
    status: string;
    avatar?: string;
    lastSeen: string;
  }>;
  messages: Array<{
    id: number;
    content: string;
    type: string;
    createdAt: string;
    sender: {
      id: number;
      username: string;
    };
  }>;
  updatedAt: string;
  unreadCount?: number;
}

interface StoryGroup {
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  stories: Array<{
    id: number;
    type: string;
    content: string;
    caption?: string;
    createdAt: string;
    hasViewed: boolean;
    viewCount: number;
  }>;
  hasUnviewed: boolean;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const ChatsScreen: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyViewerData, setStoryViewerData] = useState<{
    groupIndex: number;
    storyIndex: number;
  }>({ groupIndex: 0, storyIndex: 0 });
  const [activeTab, setActiveTab] = useState('chats');
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  // Fetch chats from backend API
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/chats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stories
  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/stories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStoryGroups(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStoryGroups([]);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchStories();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              messages: [message],
              updatedAt: message.createdAt,
              unreadCount: (chat.unreadCount || 0) + 1
            };
          }
          return chat;
        })
      );
    };

    const handleUserStatusChanged = (data: any) => {
      setChats(prevChats =>
        prevChats.map(chat => ({
          ...chat,
          participants: chat.participants.map(user =>
            user.id === data.userId
              ? { ...user, status: data.status, lastSeen: data.lastSeen }
              : user
          )
        }))
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_status_changed', handleUserStatusChanged);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_status_changed', handleUserStatusChanged);
    };
  }, [socket]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    if (chat.isGroup && chat.name) {
      return chat.name.toLowerCase().includes(searchLower);
    }
    
    return chat.participants.some(u => 
      u.id !== user?.id && u.username.toLowerCase().includes(searchLower)
    );
  });

  const handleChatClick = (chatId: number) => {
    // Clear unread count when opening chat
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
    navigate(`/chats/${chatId}`);
  };

  const handleNewChat = (chat: Chat) => {
    setChats(prevChats => [chat, ...prevChats]);
    setShowNewChatModal(false);
    navigate(`/chats/${chat.id}`);
  };

  const handleStoryClick = (storyGroup: StoryGroup, storyIndex: number = 0) => {
    const groupIndex = storyGroups.findIndex(group => group.user.id === storyGroup.user.id);
    setStoryViewerData({ groupIndex, storyIndex });
    setShowStoryViewer(true);
  };

  const handleCreateStory = () => {
    setShowCreateStoryModal(true);
  };

  const handleStoryCreated = () => {
    fetchStories(); // Refresh stories after creating
  };

  const handleSearch = () => {
    navigate('/search');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-background'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white">
        {/* Status Bar Area */}
        <div className="pt-12 px-4">
          {/* Header Title and Menu */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-wide">Chats</h1>
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200">
                <MoreVertical className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <button 
              onClick={handleSearch}
              className="w-full flex items-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 hover:bg-white/15 transition-all duration-200"
            >
              <Search className="h-5 w-5 text-white/70 mr-3" />
              <span className="text-white/70 text-left">Search messages, contacts...</span>
            </button>
          </div>

          {/* Stories Carousel */}
          <div className="pb-6">
            <StoryCarousel 
              onStoryClick={handleStoryClick}
              onCreateStory={handleCreateStory}
            />
          </div>
        </div>
      </div>

      {/* Chats List with Rounded Top */}
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl flex-1 min-h-[60vh] -mt-4 relative z-10 shadow-lg`}>
        <div className="pt-6">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No conversations yet</h3>
              <p className={`text-sm text-center mb-6 px-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Start a new conversation to begin messaging with your contacts
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-primary-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors duration-200"
              >
                Start Conversation
              </button>
            </div>
          ) : (
            <div className="pb-24">
              {filteredChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  currentUserId={user?.id || 0}
                  onClick={() => handleChatClick(chat.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation with Centered FAB */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewChatClick={() => setShowNewChatModal(true)}
      />

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleNewChat}
        />
      )}

      {showCreateStoryModal && (
        <CreateStoryModal
          onClose={() => setShowCreateStoryModal(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {showStoryViewer && (
        <StoryViewer
          storyGroups={storyGroups}
          initialGroupIndex={storyViewerData.groupIndex}
          initialStoryIndex={storyViewerData.storyIndex}
          onClose={() => setShowStoryViewer(false)}
          currentUserId={user?.id || 0}
        />
      )}
    </div>
  );
};

export default ChatsScreen;