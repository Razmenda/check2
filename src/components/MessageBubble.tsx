import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, Edit, MoreHorizontal } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  isEdited: boolean;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar = true }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative max-w-xs">
            <img
              src={message.content}
              alt="Shared image"
              className="rounded-2xl cursor-pointer hover:opacity-90 transition-opacity duration-200 w-full"
              onClick={() => window.open(message.content, '_blank')}
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center bg-white/10 rounded-2xl p-4 max-w-xs backdrop-blur-sm">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.fileName || 'File'}
              </p>
              {message.fileSize && (
                <p className="text-xs opacity-70">
                  {formatFileSize(message.fileSize)}
                </p>
              )}
            </div>
            <button
              onClick={() => window.open(message.content, '_blank')}
              className="ml-3 p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center bg-white/10 rounded-2xl p-4 max-w-xs backdrop-blur-sm">
            <div className="flex-1">
              <p className="text-sm font-medium">🎵 Audio Message</p>
              {message.fileSize && (
                <p className="text-xs opacity-70">
                  {formatFileSize(message.fileSize)}
                </p>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </div>
        );
    }
  };

  const getTimeString = () => {
    try {
      const date = new Date(message.createdAt);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return 'now';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {message.sender.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {message.sender.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className="relative">
          {/* Sender name for group chats */}
          {!isOwn && showAvatar && (
            <p className="text-xs font-semibold text-gray-600 mb-1 ml-4">
              {message.sender.username}
            </p>
          )}

          <div
            className={`relative px-4 py-3 rounded-3xl shadow-sm ${
              isOwn
                ? 'bg-primary-800 text-white rounded-br-lg'
                : 'bg-white border border-gray-100 text-gray-900 rounded-bl-lg'
            }`}
          >
            {/* Message content */}
            {renderMessageContent()}

            {/* Message footer */}
            <div className={`flex items-center justify-between mt-2 text-xs ${
              isOwn ? 'text-primary-200' : 'text-gray-500'
            }`}>
              <span className="flex items-center space-x-1">
                <span>{getTimeString()}</span>
                {message.isEdited && (
                  <>
                    <Edit className="h-3 w-3" />
                    <span>edited</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Message options */}
          <button className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded-full ${
            isOwn ? '-left-8' : '-right-8'
          }`}>
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;