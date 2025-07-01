import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HardDrive, Image, FileText, Music, Video, Trash2, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const StorageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [storageData] = useState({
    total: 64, // GB
    used: 12.4, // GB
    breakdown: {
      photos: 4.2,
      videos: 3.8,
      audio: 1.1,
      documents: 2.3,
      other: 1.0
    }
  });

  const storageItems = [
    {
      icon: Image,
      title: 'Photos',
      size: storageData.breakdown.photos,
      color: 'bg-blue-500',
      count: '1,234 items'
    },
    {
      icon: Video,
      title: 'Videos',
      size: storageData.breakdown.videos,
      color: 'bg-red-500',
      count: '89 items'
    },
    {
      icon: FileText,
      title: 'Documents',
      size: storageData.breakdown.documents,
      color: 'bg-green-500',
      count: '156 items'
    },
    {
      icon: Music,
      title: 'Audio',
      size: storageData.breakdown.audio,
      color: 'bg-purple-500',
      count: '67 items'
    },
    {
      icon: HardDrive,
      title: 'Other',
      size: storageData.breakdown.other,
      color: 'bg-gray-500',
      count: 'Cache & temp files'
    }
  ];

  const formatSize = (gb: number) => {
    if (gb < 1) {
      return `${(gb * 1024).toFixed(0)} MB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const getPercentage = (size: number) => {
    return (size / storageData.total) * 100;
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully');
  };

  const handleManageDownloads = () => {
    navigate('/settings/storage/downloads');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-primary-900'} text-white px-4 py-4 pt-12`}>
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Storage and Data</h1>
        </div>
      </div>

      <div className="pt-6 pb-6 space-y-6">
        {/* Storage Overview */}
        <div className={`mx-4 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Storage Usage
            </h3>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatSize(storageData.used)} of {formatSize(storageData.total)} used
            </div>
          </div>
          
          {/* Storage Bar */}
          <div className={`w-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden mb-4`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(storageData.used / storageData.total) * 100}%` }}
            ></div>
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
            {((storageData.total - storageData.used)).toFixed(1)} GB available
          </div>
        </div>

        {/* Storage Breakdown */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Storage Breakdown
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {storageItems.map((item, index) => (
              <div key={index} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                      <item.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.count}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatSize(item.size)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getPercentage(item.size).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className={`w-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${getPercentage(item.size)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Actions */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Storage Management
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <button
              onClick={handleManageDownloads}
              className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                <Download className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manage Downloads
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and delete downloaded files
                </p>
              </div>
            </button>

            <button
              onClick={handleClearCache}
              className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                <Trash2 className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Clear Cache
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Free up space by clearing temporary files
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Auto-download Settings */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Auto-download Media
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <div className="px-4 py-4">
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                When using mobile data
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Photos: Yes • Videos: No • Audio: Yes • Documents: No
              </p>
            </div>
            <div className="px-4 py-4">
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                When connected on Wi-Fi
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Photos: Yes • Videos: Yes • Audio: Yes • Documents: Yes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageScreen;