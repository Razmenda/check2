import React, { useState, useRef, useEffect } from 'react';
import { AtSign, Send, Paperclip, Smile, Mic } from 'lucide-react';

interface User {
  id: number;
  username: string;
  avatar?: string;
}

interface Mention {
  id: number;
  username: string;
  startIndex: number;
  endIndex: number;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: Mention[]) => void;
  onSend: () => void;
  onFileUpload: () => void;
  onVoiceRecord: () => void;
  participants: User[];
  placeholder?: string;
  disabled?: boolean;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSend,
  onFileUpload,
  onVoiceRecord,
  participants,
  placeholder = "Message...",
  disabled = false
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<User[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mentionQuery) {
      const filtered = participants.filter(p => 
        p.username.toLowerCase().includes(mentionQuery.toLowerCase())
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants([]);
    }
  }, [mentionQuery, participants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Check for @ symbol
    const beforeCursor = newValue.substring(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const afterAt = beforeCursor.substring(atIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      
      if (spaceIndex === -1 || spaceIndex > afterAt.length - 1) {
        setShowMentions(true);
        setMentionQuery(afterAt);
        setMentionPosition(atIndex);
      } else {
        setShowMentions(false);
        setMentionQuery('');
      }
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }

    onChange(newValue, mentions);
  };

  const handleMentionSelect = (user: User) => {
    if (!inputRef.current) return;

    const beforeMention = value.substring(0, mentionPosition);
    const afterMention = value.substring(mentionPosition + mentionQuery.length + 1);
    const newValue = beforeMention + `@${user.username} ` + afterMention;
    
    const newMention: Mention = {
      id: user.id,
      username: user.username,
      startIndex: mentionPosition,
      endIndex: mentionPosition + user.username.length + 1
    };

    const updatedMentions = [...mentions, newMention];
    setMentions(updatedMentions);
    
    setShowMentions(false);
    setMentionQuery('');
    
    onChange(newValue, updatedMentions);
    
    // Focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPosition = mentionPosition + user.username.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const renderInputWithMentions = () => {
    if (mentions.length === 0) {
      return value;
    }

    const parts = [];
    let lastIndex = 0;

    mentions.forEach((mention, index) => {
      // Add text before mention
      if (mention.startIndex > lastIndex) {
        parts.push(value.substring(lastIndex, mention.startIndex));
      }

      // Add mention (this is just for display, actual functionality is in MessageBubble)
      parts.push(`@${mention.username}`);
      lastIndex = mention.endIndex;
    });

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(value.substring(lastIndex));
    }

    return parts.join('');
  };

  return (
    <div className="relative">
      {/* Mention Suggestions */}
      {showMentions && filteredParticipants.length > 0 && (
        <div 
          ref={mentionListRef}
          className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mb-2 max-h-48 overflow-y-auto z-50"
        >
          {filteredParticipants.map((user) => (
            <button
              key={user.id}
              onClick={() => handleMentionSelect(user)}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{user.username}</p>
              </div>
              <AtSign className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end space-x-3">
        <button
          type="button"
          onClick={onFileUpload}
          disabled={disabled}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200 resize-none min-h-[48px] max-h-32 disabled:opacity-50"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '48px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            type="button"
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 rounded-full transition-colors duration-200 disabled:opacity-50"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>
        
        {value.trim() ? (
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="p-3 bg-primary-800 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onVoiceRecord}
            disabled={disabled}
            className="p-3 bg-primary-800 text-white rounded-full hover:bg-primary-700 transition-all duration-200 flex-shrink-0 disabled:opacity-50"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MentionInput;