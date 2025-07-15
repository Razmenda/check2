import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Download, Edit, MoreHorizontal, Reply, Forward, Copy, Trash2, 
  Check, CheckCheck, Play, Pause, Volume2, VolumeX, 
  AtSign, Pin, Star, Share
} from 'lucide-react';
import MessageReactions from './MessageReactions';

interface MessageReaction {
  id: number;
  emoji: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface MessageStatus {
  id: number;
  userId: number;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

interface MessageMention {
  id: number;
  mentionedUserId: number;
  startIndex: number;
  endIndex: number;
  mentionedUser: {
    username: string;
  };
}

interface Message {
  id: number;
  content: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  isEdited: boolean;
  createdAt: string;
  replyTo?: {
    id: number;
    content: string;
    type: string;
    sender: {
      username: string;
    };
  };
  reactions?: MessageReaction[];
  statuses?: MessageStatus[];
  mentions?: MessageMention[];
  voiceMessage?: {
    duration: number;
    waveform?: number[];
  };
  sender: {
    id: number;
    username: string;
    avatar?: string;
  };
  isForwarded?: boolean;
  forwardedFrom?: {
    username: string;
  };
  isPinned?: boolean;
  isStarred?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isGroupChat?: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: number) => void;
  onReact?: (messageId: number, emoji: string) => void;
  onRemoveReaction?: (reactionId: number) => void;
  onPin?: (messageId: number) => void;
  onStar?: (messageId: number) => void;
  onMention?: (userId: number) => void;
  currentUserId: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showAvatar = true,
  isGroupChat = false,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
  onPin,
  onStar,
  onMention,
  currentUserId
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatVoiceDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMessageStatus = () => {
    if (!isOwn || !message.statuses) return null;
    
    const readCount = message.statuses.filter(s => s.status === 'read').length;
    const deliveredCount = message.statuses.filter(s => s.status === 'delivered').length;
    const totalParticipants = message.statuses.length;
    
    if (readCount === totalParticipants) {
      return <CheckCheck className="h-4 w-4 text-blue-500" title="Read by all" />;
    } else if (readCount > 0) {
      return <CheckCheck className="h-4 w-4 text-blue-400" title={`Read by ${readCount}/${totalParticipants}`} />;
    } else if (deliveredCount > 0) {
      return <CheckCheck className="h-4 w-4 text-gray-400" title="Delivered" />;
    } else {
      return <Check className="h-4 w-4 text-gray-400" title="Sent" />;
    }
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    
    switch (action) {
      case 'reply':
        onReply?.(message);
        break;
      case 'forward':
        onForward?.(message);
        break;
      case 'edit':
        onEdit?.(message);
        break;
      case 'delete':
        onDelete?.(message.id);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content);
        break;
      case 'pin':
        onPin?.(message.id);
        break;
      case 'star':
        onStar?.(message.id);
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            text: message.content,
            title: 'Shared from Chekawak'
          });
        }
        break;
    }
  };

  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative max-w-xs group">
            <img
              src={message.content}
              alt="Shared image"
              className="rounded-2xl cursor-pointer hover:opacity-90 transition-opacity duration-200 w-full"
              onClick={() => window.open(message.content, '_blank')}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-2xl" />
          </div>
        );
      
      case 'voice':
        return (
          <div className="flex items-center bg-white/10 rounded-2xl p-4 max-w-xs backdrop-blur-sm min-w-[250px]">
            <button
              onClick={handleAudioPlay}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 hover:bg-white/30 transition-colors duration-200"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            
            {/* Waveform with progress */}
            <div className="flex-1 flex items-center space-x-1 mr-3 relative">
              <div className="absolute inset-0 bg-current/20 rounded-full" style={{ width: `${audioProgress}%` }} />
              {message.voiceMessage?.waveform ? (
                message.voiceMessage.waveform.map((amplitude, index) => (
                  <div
                    key={index}
                    className="w-1 bg-current rounded-full transition-all duration-150 relative z-10"
                    style={{ 
                      height: `${amplitude * 20 + 4}px`,
                      opacity: (index / message.voiceMessage!.waveform!.length) * 100 <= audioProgress ? 1 : 0.4
                    }}
                  />
                ))
              ) : (
                [...Array(20)].map((_, index) => (
                  <div
                    key={index}
                    className="w-1 bg-current rounded-full relative z-10"
                    style={{ 
                      height: `${Math.random() * 16 + 4}px`,
                      opacity: (index / 20) * 100 <= audioProgress ? 1 : 0.4
                    }}
                  />
                ))
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </button>
              <div className="text-xs opacity-70">
                {message.voiceMessage ? formatVoiceDuration(message.voiceMessage.duration) : '0:00'}
              </div>
            </div>
            
            <audio
              ref={audioRef}
              src={message.content}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={() => setAudioProgress(0)}
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
      
      default:
        // Render text with mentions
        const renderTextWithMentions = () => {
          if (!message.mentions || message.mentions.length === 0) {
            return <span className="whitespace-pre-wrap break-words">{message.content}</span>;
          }

          const parts = [];
          let lastIndex = 0;

          message.mentions.forEach((mention, index) => {
            // Add text before mention
            if (mention.startIndex > lastIndex) {
              parts.push(
                <span key={`text-${index}`}>
                  {message.content.substring(lastIndex, mention.startIndex)}
                </span>
              );
            }

            // Add mention
            parts.push(
              <button
                key={`mention-${index}`}
                onClick={() => onMention?.(mention.mentionedUserId)}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                @{mention.mentionedUser.username}
              </button>
            );

            lastIndex = mention.endIndex;
          });

          // Add remaining text
          if (lastIndex < message.content.length) {
            parts.push(
              <span key="text-end">
                {message.content.substring(lastIndex)}
              </span>
            );
          }

          return <div className="whitespace-pre-wrap break-words">{parts}</div>;
        };

        return (
          <div className="text-sm leading-relaxed">
            {renderTextWithMentions()}
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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group relative`}>
      <div className={`flex max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && showAvatar && isGroupChat && (
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
          {!isOwn && showAvatar && isGroupChat && (
            <p className="text-xs font-semibold text-gray-600 mb-1 ml-4">
              {message.sender.username}
            </p>
          )}

          {/* Forwarded indicator */}
          {message.isForwarded && (
            <div className={`mb-2 text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'} flex items-center`}>
              <Forward className="h-3 w-3 mr-1" />
              Forwarded {message.forwardedFrom && `from ${message.forwardedFrom.username}`}
            </div>
          )}

          {/* Reply Preview */}
          {message.replyTo && (
            <div className={`mb-2 p-2 border-l-4 ${
              isOwn ? 'border-white/30 bg-white/10' : 'border-primary-500 bg-gray-50'
            } rounded-r-lg`}>
              <p className={`text-xs font-medium ${isOwn ? 'text-white/80' : 'text-primary-700'}`}>
                {message.replyTo.sender.username}
              </p>
              <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-600'} truncate`}>
                {message.replyTo.type === 'image' ? '📷 Photo' :
                 message.replyTo.type === 'voice' ? '🎵 Voice message' :
                 message.replyTo.type === 'file' ? '📄 File' :
                 message.replyTo.content}
              </p>
            </div>
          )}

          <div
            className={`relative px-4 py-3 rounded-3xl shadow-sm ${
              isOwn
                ? 'bg-primary-800 text-white rounded-br-lg'
                : 'bg-white border border-gray-100 text-gray-900 rounded-bl-lg'
            }`}
          >
            {/* Pinned indicator */}
            {message.isPinned && (
              <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${
                isOwn ? 'bg-yellow-400' : 'bg-yellow-500'
              } flex items-center justify-center`}>
                <Pin className="h-3 w-3 text-white" />
              </div>
            )}

            {/* Message content */}
            {renderMessageContent()}

            {/* Message footer */}
            <div className={`flex items-center justify-between mt-2 text-xs ${
              isOwn ? 'text-primary-200' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                <span>{getTimeString()}</span>
                {message.isEdited && (
                  <>
                    <Edit className="h-3 w-3" />
                    <span>edited</span>
                  </>
                )}
                {message.isStarred && (
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                )}
              </div>
              {getMessageStatus()}
            </div>
          </div>

          {/* Reactions */}
          {(message.reactions && message.reactions.length > 0) && (
            <div className="mt-2">
              <MessageReactions
                reactions={message.reactions}
                onAddReaction={(emoji) => onReact?.(message.id, emoji)}
                onRemoveReaction={(reactionId) => onRemoveReaction?.(reactionId)}
                currentUserId={currentUserId}
              />
            </div>
          )}

          {/* Message options */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded-full ${
                isOwn ? '-left-8' : '-right-8'
              }`}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>

            {/* Context Menu */}
            {showMenu && (
              <div 
                ref={menuRef}
                className={`absolute top-8 ${isOwn ? 'right-0' : 'left-0'} bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[140px]`}
              >
                <button
                  onClick={() => handleMenuAction('reply')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </button>
                <button
                  onClick={() => handleMenuAction('forward')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </button>
                {message.type === 'text' && (
                  <button
                    onClick={() => handleMenuAction('copy')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                )}
                <button
                  onClick={() => handleMenuAction('star')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Star className={`h-4 w-4 mr-2 ${message.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
                  {message.isStarred ? 'Unstar' : 'Star'}
                </button>
                <button
                  onClick={() => handleMenuAction('pin')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Pin className={`h-4 w-4 mr-2 ${message.isPinned ? 'text-blue-500' : ''}`} />
                  {message.isPinned ? 'Unpin' : 'Pin'}
                </button>
                {navigator.share && (
                  <button
                    onClick={() => handleMenuAction('share')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </button>
                )}
                {isOwn && message.type === 'text' && (
                  <button
                    onClick={() => handleMenuAction('edit')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                )}
                {isOwn && (
                  <button
                    onClick={() => handleMenuAction('delete')}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;