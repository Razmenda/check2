import React from 'react';
import { MessageCircle, Phone, Users, Settings, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewChatClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange, onNewChatClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { 
      id: 'chats', 
      icon: MessageCircle, 
      label: 'Chats', 
      color: '#10B981',
      route: '/chats'
    },
    { 
      id: 'calls', 
      icon: Phone, 
      label: 'Calls', 
      color: '#6B7280',
      route: '/calls'
    },
    { 
      id: 'fab', 
      icon: Plus, 
      label: '', 
      color: '#F97316',
      route: '',
      isFab: true
    },
    { 
      id: 'contacts', 
      icon: Users, 
      label: 'Contacts', 
      color: '#6B7280',
      route: '/contacts'
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Settings', 
      color: '#6B7280',
      route: '/settings'
    },
  ];

  const handleTabClick = (tab: any) => {
    if (tab.isFab) {
      onNewChatClick?.();
      return;
    }
    onTabChange(tab.id);
    navigate(tab.route);
  };

  // Determine active tab based on current route
  const getCurrentTab = () => {
    if (location.pathname.startsWith('/chats')) return 'chats';
    if (location.pathname.startsWith('/calls')) return 'calls';
    if (location.pathname.startsWith('/contacts')) return 'contacts';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return activeTab;
  };

  const currentTab = getCurrentTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 z-30 rounded-t-3xl shadow-lg">
      <div className="flex justify-around items-center relative">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center py-2 px-3 transition-all duration-200 ${
              tab.isFab 
                ? 'relative -top-6 w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105' 
                : currentTab === tab.id 
                  ? 'transform scale-110' 
                  : 'opacity-60 hover:opacity-80'
            }`}
          >
            <tab.icon 
              className={`${tab.isFab ? 'h-7 w-7 text-white' : 'h-6 w-6 mb-1'}`}
              style={{ color: tab.isFab ? 'white' : currentTab === tab.id ? tab.color : '#6B7280' }}
            />
            {!tab.isFab && (
              <span 
                className="text-xs font-medium"
                style={{ color: currentTab === tab.id ? tab.color : '#6B7280' }}
              >
                {tab.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;