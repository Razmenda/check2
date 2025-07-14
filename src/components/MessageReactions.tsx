import React, { useState } from 'react';
import { Smile, Plus } from 'lucide-react';

interface Reaction {
  id: number;
  emoji: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: number) => void;
  currentUserId: number;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onAddReaction,
  onRemoveReaction,
  currentUserId
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '👏', '🎉', '💯'];

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const handleEmojiClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji && r.user.id === currentUserId);
    
    if (existingReaction) {
      onRemoveReaction(existingReaction.id);
    } else {
      onAddReaction(emoji);
    }
    
    setShowEmojiPicker(false);
  };

  if (reactions.length === 0 && !showEmojiPicker) {
    return null;
  }

  return (
    <div className="relative">
      {/* Existing Reactions */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
            const hasUserReacted = reactionList.some(r => r.user.id === currentUserId);
            return (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                  hasUserReacted
                    ? 'bg-primary-100 border border-primary-300 text-primary-800'
                    : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
                title={reactionList.map(r => r.user.username).join(', ')}
              >
                <span>{emoji}</span>
                <span className="font-medium">{reactionList.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
        >
          <Smile className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors duration-200 text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageReactions;