import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Volume2, VolumeX, Smartphone, MessageSquare, Phone, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [settings, setSettings] = useState({
    notifications: true,
    messageNotifications: true,
    callNotifications: true,
    groupNotifications: true,
    sound: true,
    vibration: true,
    popup: true,
    messagePreview: true,
    callRingtone: 'Default',
    notificationTone: 'Default',
    groupTone: 'Default'
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    toast.success('Settings updated');
  };

  const ringtones = ['Default', 'Classic', 'Digital', 'Gentle', 'Upbeat'];
  const notificationTones = ['Default', 'Ding', 'Chime', 'Bell', 'Pop'];

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
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>

      <div className="pt-6 pb-6 space-y-6">
        {/* General Notifications */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            General
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notifications
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enable all notifications
                  </p>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('notifications')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.notifications ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Notifications */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Messages
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <MessageSquare className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Message notifications
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Show notifications for new messages
                  </p>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('messageNotifications')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.messageNotifications ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.messageNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <Users className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Group notifications
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Show notifications for group messages
                  </p>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('groupNotifications')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.groupNotifications ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.groupNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call Notifications */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Calls
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <Phone className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Call notifications
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Show notifications for incoming calls
                  </p>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('callNotifications')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.callNotifications ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.callNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sound & Vibration */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Sound & Vibration
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  {settings.sound ? (
                    <Volume2 className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  ) : (
                    <VolumeX className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sound
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Play notification sounds
                  </p>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('sound')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.sound ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.sound ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <Smartphone className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Vibration
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Vibrate for notifications
                  </p>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('vibration')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.vibration ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                  settings.vibration ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsScreen;