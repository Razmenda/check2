import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Heart, Users, Shield, ExternalLink, Github, Twitter, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AboutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Lead Developer',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Sarah Chen',
      role: 'UI/UX Designer',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Backend Engineer',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Instant message delivery with end-to-end encryption'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your conversations are private and secure'
    },
    {
      icon: Users,
      title: 'Group Chats',
      description: 'Connect with multiple people at once'
    }
  ];

  const links = [
    {
      icon: Globe,
      title: 'Website',
      url: 'https://chekawak.com',
      description: 'Visit our official website'
    },
    {
      icon: Github,
      title: 'GitHub',
      url: 'https://github.com/chekawak',
      description: 'View our open source code'
    },
    {
      icon: Twitter,
      title: 'Twitter',
      url: 'https://twitter.com/chekawak',
      description: 'Follow us for updates'
    }
  ];

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
          <h1 className="text-xl font-bold">About</h1>
        </div>
      </div>

      <div className="pt-6 pb-6 space-y-6">
        {/* App Info */}
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl mb-4 shadow-2xl">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Chekawak Messenger
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Version 1.0.0
          </p>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} max-w-md mx-auto leading-relaxed`}>
            A secure, fast, and beautiful messaging app designed to keep you connected with the people who matter most.
          </p>
        </div>

        {/* Features */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Key Features
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {features.map((feature, index) => (
              <div key={index} className="px-4 py-4">
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4 flex-shrink-0`}>
                    <feature.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {feature.title}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Meet the Team
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {teamMembers.map((member, index) => (
              <div key={index} className="px-4 py-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {member.name}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Connect with Us
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {links.map((link, index) => (
              <button
                key={index}
                onClick={() => window.open(link.url, '_blank')}
                className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
              >
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <link.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {link.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {link.description}
                  </p>
                </div>
                <ExternalLink className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Legal
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <button
              onClick={() => window.open('/privacy-policy', '_blank')}
              className={`w-full flex items-center justify-between px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Privacy Policy
              </span>
              <ExternalLink className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => window.open('/terms-of-service', '_blank')}
              className={`w-full flex items-center justify-between px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Terms of Service
              </span>
              <ExternalLink className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => window.open('/licenses', '_blank')}
              className={`w-full flex items-center justify-between px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
            >
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Open Source Licenses
              </span>
              <ExternalLink className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Made with Love */}
        <div className="text-center px-4 py-6">
          <div className="flex items-center justify-center mb-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Made with
            </span>
            <Heart className="h-4 w-4 text-red-500 mx-2" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              for secure communication
            </span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2024 Chekawak Messenger. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;