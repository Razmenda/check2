import React from 'react';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const location = useLocation();
  
  // Don't show the separate FAB anymore since it's integrated into the bottom navigation
  return null;
};

export default FloatingActionButton;