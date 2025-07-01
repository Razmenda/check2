import React from 'react';

interface FloatingButtonProps {
  icon: React.ComponentType<any>;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'accent';
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  className = '',
  variant = 'accent'
}) => {
  const baseClasses = "fixed w-14 h-14 rounded-full shadow-float hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40";
  const variantClasses = variant === 'accent' 
    ? "bg-accent-400 hover:bg-accent-500 text-white" 
    : "bg-primary-800 hover:bg-primary-700 text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
};

export default FloatingButton;