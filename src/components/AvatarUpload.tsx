import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  username: string;
  onAvatarChange: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  username, 
  onAvatarChange, 
  size = 'lg' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    onAvatarChange(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
        {currentAvatar ? (
          <img 
            src={currentAvatar} 
            alt={username} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`absolute bottom-0 right-0 ${buttonSizes[size]} bg-primary-800 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors duration-200`}
      >
        <Camera className={`${iconSizes[size]} text-white`} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;