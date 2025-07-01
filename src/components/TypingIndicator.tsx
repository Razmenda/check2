import React from 'react';

interface TypingIndicatorProps {
  users: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing`;
    } else {
      return `${users[0]} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex justify-start">
      <div className="flex max-w-xs">
        <div className="w-8 h-8 mr-2"></div> {/* Spacer for alignment */}
        <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">{getTypingText()}</span>
            <div className="typing-dots ml-2">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;