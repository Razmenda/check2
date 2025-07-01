import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  status: string;
  avatar?: string;
}

interface AvatarCarouselProps {
  users?: User[];
  onUserClick?: (user: User) => void;
}

const API_BASE_URL = '';

const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ users, onUserClick }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>(users || []);
  const [loading, setLoading] = useState(!users);

  useEffect(() => {
    if (users) {
      setOnlineUsers(users);
      return;
    }

    const fetchOnlineUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch users and filter for online ones
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          params: { search: '' },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter for online users (in a real app, this would be handled by the backend)
        const users = response.data.filter((user: User) => user.status === 'online').slice(0, 10);
        setOnlineUsers(users);
      } catch (error) {
        console.error('Error fetching online users:', error);
        setOnlineUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineUsers();
  }, [users]);

  if (loading) {
    return (
      <div className="py-2">
        <div className="flex space-x-4 px-1">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (onlineUsers.length === 0) return null;

  return (
    <div className="py-2">
      <div className="flex overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-1">
          {onlineUsers.map((user) => (
            <div 
              key={user.id} 
              className="flex-shrink-0 cursor-pointer transform hover:scale-105 transition-transform duration-200"
              onClick={() => onUserClick?.(user)}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/30 shadow-xl backdrop-blur-sm">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <span className="text-white font-semibold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Online indicator with glow effect */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full shadow-lg">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarCarousel;