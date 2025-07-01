import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User, HelpCircle, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface NavBarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const NavBarDropdown: React.FC<NavBarDropdownProps> = ({ isOpen, onClose, anchorRef }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
    toast.success('Logged out successfully');
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      action: () => {
        navigate('/settings/profile');
        onClose();
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        navigate('/settings');
        onClose();
      }
    },
    {
      icon: isDarkMode ? Sun : Moon,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      action: () => {
        toggleDarkMode();
        onClose();
        toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
      }
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        navigate('/settings/help');
        onClose();
      }
    },
    {
      icon: LogOut,
      label: 'Log Out',
      action: handleLogout,
      danger: true
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              item.danger 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <item.icon className="h-4 w-4 mr-3" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavBarDropdown;