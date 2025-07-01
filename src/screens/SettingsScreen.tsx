import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Camera,
  Edit3,
  Phone,
  Mail,
  Globe,
  Lock,
  Eye,
  MessageSquare,
  Download,
  Trash2,
  Users,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NavBar from '../components/NavBar';
import BottomNavigation from '../components/BottomNavigation';

const SettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          subtitle: 'Name, phone, email',
          action: () => navigate('/settings/profile')
        },
        {
          icon: Camera,
          label: 'Avatar',
          subtitle: 'Change profile picture',
          action: () => {}
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: 'Dark Mode',
          subtitle: isDarkMode ? 'Switch to light mode' : 'Switch to dark mode',
          action: toggleDarkMode,
          toggle: true,
          enabled: isDarkMode
        },
        {
          icon: Bell,
          label: 'Notifications',
          subtitle: 'Message, group & call tones',
          action: () => navigate('/settings/notifications')
        },
        {
          icon: MessageSquare,
          label: 'Chats',
          subtitle: 'Theme, wallpapers, chat history',
          action: () => navigate('/settings/chats')
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy',
          subtitle: 'Block contacts, disappearing messages',
          action: () => navigate('/settings/privacy')
        },
        {
          icon: Lock,
          label: 'Security',
          subtitle: 'Change password, two-step verification',
          action: () => navigate('/settings/security')
        },
        {
          icon: Eye,
          label: 'Last Seen & Online',
          subtitle: 'Control who can see your activity',
          action: () => navigate('/settings/privacy/last-seen')
        }
      ]
    },
    {
      title: 'Storage & Data',
      items: [
        {
          icon: Download,
          label: 'Storage Usage',
          subtitle: 'Network usage, auto-download',
          action: () => navigate('/settings/storage')
        },
        {
          icon: Globe,
          label: 'Data and Storage Usage',
          subtitle: 'Network usage, auto-download',
          action: () => navigate('/settings/data')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help',
          subtitle: 'Help center, contact us, privacy policy',
          action: () => navigate('/settings/help')
        },
        {
          icon: Info,
          label: 'About',
          subtitle: 'App info, version, terms',
          action: () => navigate('/settings/about')
        },
        {
          icon: Heart,
          label: 'Tell a Friend',
          subtitle: 'Share Chekawak with friends',
          action: () => {}
        }
      ]
    }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
      <NavBar 
        title="Settings"
        variant={isDarkMode ? 'dark' : 'default'}
      />

      <div className="pt-16 pb-24">
        {/* Profile Section */}
        <div className={`px-4 py-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-800 rounded-full flex items-center justify-center">
                <Edit3 className="h-3 w-3 text-white" />
              </button>
            </div>
            <div className="ml-4 flex-1">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.username}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6 py-4">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
                {group.title}
              </h3>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {group.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                      <item.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                    {item.toggle ? (
                      <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        item.enabled ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                          item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </div>
                    ) : (
                      <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} transition-colors duration-200`}
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-red-600">Log Out</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sign out of your account
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="px-4 py-6 text-center">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Chekawak Messenger v1.0.0
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
            Made with ❤️ for secure communication
          </p>
        </div>
      </div>

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default SettingsScreen;