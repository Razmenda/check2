import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, MessageCircle, Phone, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';

interface SearchResult {
  id: number;
  type: 'chat' | 'contact' | 'message';
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: string;
  content?: string;
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock recent searches
  const mockRecentSearches = ['Andrew', 'video call', 'project files', 'meeting'];
  
  // Mock trending searches
  const trendingSearches = ['group chat', 'video calls', 'file sharing', 'notifications'];

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: 1,
      type: 'chat',
      title: 'Andrew Nichols',
      subtitle: 'Yeah, we all here! Hurry up!',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      timestamp: '10:24'
    },
    {
      id: 2,
      type: 'contact',
      title: 'Irene Casey',
      subtitle: 'Online',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 3,
      type: 'message',
      title: 'Project Discussion',
      subtitle: 'In group: Team Alpha',
      content: 'Can we schedule a meeting for tomorrow?',
      timestamp: 'Yesterday'
    }
  ];

  useEffect(() => {
    setRecentSearches(mockRecentSearches);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setLoading(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = mockResults.filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.content?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [result.title, ...prev.filter(item => item !== result.title)].slice(0, 10);
      return updated;
    });

    // Navigate based on result type
    if (result.type === 'chat' || result.type === 'contact') {
      navigate(`/chats/${result.id}`);
    } else if (result.type === 'message') {
      navigate(`/chats/${result.id}`);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'contact':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Search className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <div className="bg-primary-900 text-white px-4 py-4 pt-12">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages, contacts..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="pt-4 pb-6">
        {searchQuery.trim() === '' ? (
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="px-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    Recent
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-primary-800 hover:text-primary-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="px-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />
                Trending
              </h3>
              <div className="space-y-2">
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <TrendingUp className="h-4 w-4 text-orange-500 mr-3" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try searching for something else</p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </h3>
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center w-full p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    {/* Avatar or Icon */}
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      {result.avatar ? (
                        <img src={result.avatar} alt={result.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{result.title}</h4>
                        {result.timestamp && (
                          <span className="text-xs text-gray-500 ml-2">{result.timestamp}</span>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                      )}
                      {result.content && (
                        <p className="text-sm text-gray-500 truncate mt-1">{result.content}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;