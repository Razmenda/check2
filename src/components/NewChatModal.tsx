import React, { useState, useEffect } from 'react';
import { X, Search, Users, UserPlus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  avatar?: string;
}

interface Chat {
  id: number;
  name?: string;
  isGroup: boolean;
  participants: User[];
}

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (chat: Chat) => void;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          params: { search: searchQuery },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        const newSelection = prev.filter(u => u.id !== user.id);
        if (newSelection.length < 2) {
          setIsGroup(false);
        }
        return newSelection;
      } else {
        const newSelection = [...prev, user];
        if (newSelection.length >= 2) {
          setIsGroup(true);
        }
        return newSelection;
      }
    });
  };

  const createChat = async () => {
    if (selectedUsers.length === 0) return;

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/chats`, {
        participantIds: selectedUsers.map(u => u.id),
        isGroup,
        name: isGroup ? groupName : undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Chat created successfully!');
      onChatCreated(response.data);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.response?.data?.error || 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = selectedUsers.length > 0 && (!isGroup || groupName.trim());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center bg-primary-100 text-primary-800 px-3 py-2 rounded-full text-sm font-medium"
                  >
                    <span className="mr-2">{user.username}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Group Chat Options */}
              {isGroup && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-700">Group Chat</span>
                  </div>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name..."
                    className="w-full px-4 py-3 border-0 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 px-6">
                {searchQuery ? (
                  <div>
                    <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div>
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Search for people</p>
                    <p className="text-sm text-gray-400 mt-1">Start typing to find contacts</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    {selectedUsers.some(u => u.id === user.id) && (
                      <div className="w-6 h-6 bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={createChat}
              disabled={!canCreate || creating}
              className="w-full bg-primary-800 text-white py-4 px-4 rounded-2xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                `Start ${isGroup ? 'Group ' : ''}Chat`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;