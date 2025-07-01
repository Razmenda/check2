import React, { useRef, useState } from 'react';
import { ArrowLeft, Search, MoreVertical } from 'lucide-react';
import NavBarDropdown from './NavBarDropdown';

interface NavBarAction {
  icon: React.ComponentType<any>;
  onClick: () => void;
}

interface NavBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightActions?: NavBarAction[];
  variant?: 'default' | 'dark';
}

const NavBar: React.FC<NavBarProps> = ({ 
  title, 
  subtitle,
  onBack, 
  showSearch = false,
  onSearchClick,
  rightActions = [],
  variant = 'default'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownAnchorRef = useRef<HTMLButtonElement>(null);
  const isDark = variant === 'dark';
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${
      isDark ? 'bg-dark-primary' : 'bg-primary-900'
    } text-white`}>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-white/70 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 relative">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          
          {rightActions.length > 0 ? (
            rightActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
              >
                <action.icon className="h-5 w-5" />
              </button>
            ))
          ) : (
            <button 
              ref={dropdownAnchorRef}
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          )}

          <NavBarDropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            anchorRef={dropdownAnchorRef}
          />
        </div>
      </div>
    </div>
  );
};

export default NavBar;