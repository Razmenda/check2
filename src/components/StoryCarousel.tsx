import React, { useState, useEffect } from 'react';
import { Plus, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Story {
  id: number;
  type: string;
  content: string;
  caption?: string;
  createdAt: string;
  hasViewed: boolean;
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

interface StoryCarouselProps {
  onStoryClick: (storyGroup: StoryGroup, storyIndex?: number) => void;
  onCreateStory: () => void;
}

const API_BASE_URL = '';

const StoryCarousel: React.FC<StoryCarouselProps> = ({ onStoryClick, onCreateStory }) => {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStories();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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

  const currentUserStories = storyGroups.find(group => group.user.id === user?.id);
  const otherStories = storyGroups.filter(group => group.user.id !== user?.id);

  return (
    <div className="py-2">
      <div className="flex overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-1">
          {/* Current User's Story or Add Story Button */}
          <div className="flex-shrink-0 cursor-pointer transform hover:scale-105 transition-transform duration-200">
            <div className="relative" onClick={currentUserStories ? () => onStoryClick(currentUserStories, 0) : onCreateStory}>
              <div className={`w-16 h-16 rounded-full overflow-hidden border-3 shadow-xl backdrop-blur-sm ${
                currentUserStories ? 'border-emerald-400' : 'border-white/30'
              }`}>
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <span className="text-white font-semibold text-lg">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Add Story Button or Story Indicator */}
              {!currentUserStories ? (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
                  <Plus className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-3 border-white rounded-full shadow-lg">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse opacity-75"></div>
                </div>
              )}
            </div>
          </div>

          {/* Other Users' Stories */}
          {otherStories.map((storyGroup) => (
            <div 
              key={storyGroup.user.id} 
              className="flex-shrink-0 cursor-pointer transform hover:scale-105 transition-transform duration-200"
              onClick={() => onStoryClick(storyGroup, 0)}
            >
              <div className="relative">
                <div className={`w-16 h-16 rounded-full overflow-hidden border-3 shadow-xl backdrop-blur-sm ${
                  storyGroup.hasUnviewed ? 'border-orange-400' : 'border-gray-400'
                }`}>
                  {storyGroup.user.avatar ? (
                    <img 
                      src={storyGroup.user.avatar} 
                      alt={storyGroup.user.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <span className="text-white font-semibold text-lg">
                        {storyGroup.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Story Ring Indicator */}
                {storyGroup.hasUnviewed && (
                  <div className="absolute inset-0 rounded-full border-3 border-orange-400 animate-pulse"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryCarousel;