import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: number;
  username: string;
  status: string;
  avatar?: string;
  lastSeen: string;
}

interface Message {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
}

interface Chat {
  id: number;
  name?: string;
  isGroup: boolean;
  participants: User[];
  messages: Message[];
  updatedAt: string;
  unreadCount?: number;
}

interface ChatItemProps {
  chat: Chat;
  currentUserId: number;
  onClick: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, currentUserId, onClick }) => {
  // Get chat display info
  const getChatInfo = () => {
    if (chat.isGroup) {
      return {
        name: chat.name || 'Group Chat',
        avatar: null,
        isOnline: false,
      };
    }

    const otherUser = chat.participants.find(user => user.id !== currentUserId);
    return {
      name: otherUser?.username || 'Unknown User',
      avatar: otherUser?.avatar,
      isOnline: otherUser?.status === 'online',
    };
  };

  const { name, avatar, isOnline } = getChatInfo();
  const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;
  
  // Format last message
  const getLastMessageText = () => {
    if (!lastMessage) return 'No messages yet';
    
    const isOwn = lastMessage.sender.id === currentUserId;
    const prefix = chat.isGroup && !isOwn ? `${lastMessage.sender.username}: ` : '';
    
    switch (lastMessage.type) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'file':
        return `${prefix}📄 File`;
      case 'audio':
        return `${prefix}🎵 Audio`;
      default:
        return `${prefix}${lastMessage.content}`;
    }
  };

  const getTimeString = () => {
    if (!lastMessage) return '';
    
    try {
      const date = new Date(lastMessage.createdAt);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        return formatDistanceToNow(date, { addSuffix: false });
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 active:bg-gray-100"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 mr-4">
        <div className="w-14 h-14 rounded-full overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate text-base">{name}</h3>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            <span className="text-sm text-gray-500">
              {getTimeString()}
            </span>
            {chat.unreadCount && chat.unreadCount > 0 && (
              <div className="bg-orange-400 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 truncate">
          {getLastMessageText()}
        </p>
      </div>
    </div>
  );
};

export default ChatItem;