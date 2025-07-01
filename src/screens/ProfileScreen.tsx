import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AvatarUpload from '../components/AvatarUpload';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = '';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: 'Hey there! I am using Chekawak Messenger.',
    phone: '+1 234 567 8900'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/users/${user?.id}`, {
        username: formData.username,
        bio: formData.bio,
        phone: formData.phone
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: 'Hey there! I am using Chekawak Messenger.',
      phone: '+1 234 567 8900'
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/users/${user?.id}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Avatar updated successfully!');
      // In a real app, you'd update the user context here
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-primary-900'} text-white px-4 py-4 pt-12`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Edit3 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="pt-6 pb-6">
        {/* Avatar Section */}
        <div className="text-center mb-8">
          <AvatarUpload
            currentAvatar={user?.avatar}
            username={user?.username || ''}
            onAvatarChange={handleAvatarChange}
            size="lg"
          />
        </div>

        {/* Profile Fields */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
          {/* Username */}
          <div className="px-4 py-4">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            ) : (
              <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formData.username}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="px-4 py-4">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              About
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none`}
              />
            ) : (
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formData.bio}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="px-4 py-4">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            ) : (
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formData.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="px-4 py-4">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Email
            </label>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formData.email}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="px-4 py-6">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-center`}>
            Joined Chekawak on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;