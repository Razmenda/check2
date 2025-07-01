import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Smile, Send, MoreVertical, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Story {
  id: number;
  type: string;
  content: string;
  caption?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  hasViewed: boolean;
  viewCount: number;
}

interface StoryGroup {
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  stories: Story[];
  hasUnviewed: boolean;
}

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
  currentUserId: number;
}

const API_BASE_URL = '';

const StoryViewer: React.FC<StoryViewerProps> = ({
  storyGroups,
  initialGroupIndex,
  initialStoryIndex,
  onClose,
  currentUserId
}) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reactionText, setReactionText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [storyViews, setStoryViews] = useState<any[]>([]);
  const [storyReactions, setStoryReactions] = useState<any[]>([]);
  const [showInteractions, setShowInteractions] = useState(false);

  const progressRef = useRef<NodeJS.Timeout>();
  const storyDuration = 5000; // 5 seconds per story

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isOwnStory = currentGroup?.user.id === currentUserId;

  useEffect(() => {
    if (currentStory && !currentStory.hasViewed) {
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory]);

  useEffect(() => {
    if (!isPaused && currentStory) {
      startProgress();
    } else {
      stopProgress();
    }

    return () => stopProgress();
  }, [currentGroupIndex, currentStoryIndex, isPaused]);

  const startProgress = () => {
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (100 / (storyDuration / 100));
      });
    }, 100);
  };

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
  };

  const markStoryAsViewed = async (storyId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/stories/${storyId}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
    }
  };

  const sendReaction = async (type: string, emoji?: string) => {
    if (!currentStory) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/stories/${currentStory.id}/react`, {
        type,
        emoji
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Reaction sent!');
      setShowReactions(false);
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Failed to send reaction');
    }
  };

  const sendMessage = () => {
    if (!reactionText.trim()) return;
    
    // Here you would typically send a message to the story owner
    toast.success('Message sent!');
    setReactionText('');
  };

  const loadStoryInteractions = async () => {
    if (!isOwnStory || !currentStory) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/stories/${currentStory.id}/interactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStoryViews(response.data.views);
      setStoryReactions(response.data.reactions);
      setShowInteractions(true);
    } catch (error) {
      console.error('Error loading story interactions:', error);
      toast.error('Failed to load story interactions');
    }
  };

  const reactions = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Laugh' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' }
  ];

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress Bars */}
      <div className="flex space-x-1 p-4 pt-12">
        {currentGroup.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: index < currentStoryIndex ? '100%' : 
                       index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            {currentGroup.user.avatar ? (
              <img src={currentGroup.user.avatar} alt={currentGroup.user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {currentGroup.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{currentGroup.user.username}</h3>
            <p className="text-white/70 text-sm">
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isOwnStory && (
            <button
              onClick={loadStoryInteractions}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Eye className="h-5 w-5 text-white" />
            </button>
          )}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <MoreVertical className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        {/* Navigation Areas */}
        <div 
          className="absolute left-0 top-0 w-1/3 h-full z-10"
          onClick={previousStory}
        />
        <div 
          className="absolute right-0 top-0 w-1/3 h-full z-10"
          onClick={nextStory}
        />

        {/* Story Content */}
        {currentStory.type === 'image' ? (
          <img 
            src={currentStory.content} 
            alt="Story" 
            className="max-w-full max-h-full object-contain"
          />
        ) : currentStory.type === 'video' ? (
          <video 
            src={currentStory.content} 
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
            loop
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center p-8"
            style={{ 
              backgroundColor: currentStory.backgroundColor || '#1F3934',
              color: currentStory.textColor || '#FFFFFF'
            }}
          >
            <p className="text-2xl font-bold text-center">{currentStory.content}</p>
          </div>
        )}

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-center bg-black/50 rounded-lg p-3">
              {currentStory.caption}
            </p>
          </div>
        )}
      </div>

      {/* Reaction Input */}
      {!isOwnStory && (
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-2">
              <input
                type="text"
                value={reactionText}
                onChange={(e) => setReactionText(e.target.value)}
                placeholder="Send message..."
                className="flex-1 bg-transparent text-white placeholder-white/70 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!reactionText.trim()}
                className="ml-2 p-1 disabled:opacity-50"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
            <button
              onClick={() => sendReaction('love', '❤️')}
              className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-200"
            >
              <Heart className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Reactions Popup */}
      {showReactions && !isOwnStory && (
        <div className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-6 gap-3">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => sendReaction(reaction.type, reaction.emoji)}
                className="flex flex-col items-center p-3 hover:bg-white/20 rounded-xl transition-colors duration-200"
              >
                <span className="text-2xl mb-1">{reaction.emoji}</span>
                <span className="text-xs text-gray-700">{reaction.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Story Interactions Modal */}
      {showInteractions && isOwnStory && (
        <div className="absolute inset-0 bg-black/80 flex items-end">
          <div className="w-full bg-white rounded-t-3xl max-h-2/3 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Story Interactions</h3>
                <button
                  onClick={() => setShowInteractions(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {currentStory.viewCount} views • {storyReactions.length} reactions
              </p>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {/* Views */}
              {storyViews.length > 0 && (
                <div className="p-4">
                  <h4 className="font-semibold mb-3">Views</h4>
                  {storyViews.map((view) => (
                    <div key={view.id} className="flex items-center py-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        {view.viewer.avatar ? (
                          <img src={view.viewer.avatar} alt={view.viewer.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {view.viewer.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{view.viewer.username}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(view.viewedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reactions */}
              {storyReactions.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">Reactions</h4>
                  {storyReactions.map((reaction) => (
                    <div key={reaction.id} className="flex items-center py-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        {reaction.user.avatar ? (
                          <img src={reaction.user.avatar} alt={reaction.user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {reaction.user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{reaction.user.username}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(reaction.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <span className="text-2xl">{reaction.emoji}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;