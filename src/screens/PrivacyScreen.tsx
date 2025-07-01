import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Shield, Clock, Users, MessageSquare, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const PrivacyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [settings, setSettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    status: 'contacts',
    readReceipts: true,
    groups: 'everyone',
    liveLocation: 'nobody',
    blockedContacts: 0
  });

  const privacyOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'My contacts' },
    { value: 'nobody', label: 'Nobody' }
  ];

  const privacySettings = [
    {
      icon: Clock,
      title: 'Last seen and online',
      subtitle: settings.lastSeen,
      key: 'lastSeen'
    },
    {
      icon: Eye,
      title: 'Profile photo',
      subtitle: settings.profilePhoto,
      key: 'profilePhoto'
    },
    {
      icon: MessageSquare,
      title: 'About',
      subtitle: settings.about,
      key: 'about'
    },
    {
      icon: Users,
      title: 'Groups',
      subtitle: settings.groups,
      key: 'groups'
    }
  ];

  const handlePrivacyChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Privacy setting updated');
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
          <h1 className="text-xl font-bold">Privacy</h1>
        </div>
      </div>

      <div className="pt-6 pb-6 space-y-6">
        {/* Who can see my personal info */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Who can see my personal info
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {privacySettings.map((setting) => (
              <button
                key={setting.key}
                onClick={() => {
                  // Here you would show a modal to select privacy option
                  const newValue = setting.subtitle === 'everyone' ? 'contacts' : 
                                  setting.subtitle === 'contacts' ? 'nobody' : 'everyone';
                  handlePrivacyChange(setting.key, newValue);
                }}
                className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
              >
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <setting.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {setting.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                    {setting.subtitle}
                  </p>
                </div>
                <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Messages
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <Eye className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Read receipts
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    If turned off, you won't send or receive read receipts
                  </p>
                </div>
              </div>
              <div 
                onClick={() => {
                  setSettings(prev => ({ ...prev, readReceipts: !prev.readReceipts }));
                  toast.success('Read receipts setting updated');
                }}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.readReceipts ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.readReceipts ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Blocked contacts */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Blocked contacts
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={() => navigate('/settings/privacy/blocked')}
              className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                <Shield className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Blocked contacts
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {settings.blockedContacts} contacts
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Advanced */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Advanced
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <button
              onClick={() => navigate('/settings/privacy/disappearing')}
              className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                <Clock className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Disappearing messages
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Off
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;