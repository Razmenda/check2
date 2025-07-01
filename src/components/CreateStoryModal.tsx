import React, { useState, useRef } from 'react';
import { X, Camera, Type, Palette, Upload, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CreateStoryModalProps {
  onClose: () => void;
  onStoryCreated: () => void;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose, onStoryCreated }) => {
  const [storyType, setStoryType] = useState<'text' | 'image' | 'video'>('text');
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1F3934');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundColors = [
    '#1F3934', '#2563EB', '#DC2626', '#059669', '#7C3AED',
    '#EA580C', '#DB2777', '#0891B2', '#65A30D', '#CA8A04'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setStoryType(file.type.startsWith('video/') ? 'video' : 'image');
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const createStory = async () => {
    if (storyType === 'text' && !content.trim()) {
      toast.error('Please enter some text for your story');
      return;
    }

    if ((storyType === 'image' || storyType === 'video') && !selectedFile) {
      toast.error('Please select a file for your story');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', storyType);
      formData.append('caption', caption);
      formData.append('backgroundColor', backgroundColor);
      formData.append('textColor', textColor);

      if (storyType === 'text') {
        formData.append('content', content);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Story created successfully!');
      onStoryCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast.error(error.response?.data?.error || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Story Type Selection */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={() => setStoryType('text')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-colors duration-200 ${
                storyType === 'text' ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Type className="h-5 w-5 mr-2" />
              Text
            </button>
            <button
              onClick={() => {
                setStoryType('image');
                fileInputRef.current?.click();
              }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-colors duration-200 ${
                storyType === 'image' ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="h-5 w-5 mr-2" />
              Photo
            </button>
            <button
              onClick={() => {
                setStoryType('video');
                fileInputRef.current?.click();
              }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-colors duration-200 ${
                storyType === 'video' ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Video
            </button>
          </div>

          {/* Preview Area */}
          <div className="mb-6">
            <div 
              className="w-full h-64 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: storyType === 'text' ? backgroundColor : '#f3f4f6' }}
            >
              {storyType === 'text' ? (
                <div className="text-center p-4">
                  {content ? (
                    <p 
                      className="text-xl font-bold break-words"
                      style={{ color: textColor }}
                    >
                      {content}
                    </p>
                  ) : (
                    <p className="text-white/70">Your text will appear here</p>
                  )}
                </div>
              ) : previewUrl ? (
                storyType === 'image' ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={previewUrl} className="w-full h-full object-cover" controls />
                )
              ) : (
                <div className="text-center text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Select a file to preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Text Input for Text Stories */}
          {storyType === 'text' && (
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">{content.length}/200</p>
            </div>
          )}

          {/* Background Color Selection for Text Stories */}
          {storyType === 'text' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Palette className="h-4 w-4 inline mr-2" />
                Background Color
              </label>
              <div className="grid grid-cols-5 gap-3">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-12 h-12 rounded-xl transition-transform duration-200 ${
                      backgroundColor === color ? 'scale-110 ring-2 ring-primary-500' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={createStory}
            disabled={loading || (storyType === 'text' && !content.trim()) || ((storyType === 'image' || storyType === 'video') && !selectedFile)}
            className="w-full bg-primary-800 text-white py-4 px-4 rounded-2xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Share Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;