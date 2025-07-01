import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageCircle, Mail, ExternalLink, Phone, Book, Bug } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const HelpScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        'How to create an account',
        'Setting up your profile',
        'Adding contacts',
        'Sending your first message'
      ]
    },
    {
      title: 'Messaging',
      items: [
        'Sending photos and videos',
        'Voice messages',
        'Group chats',
        'Message formatting'
      ]
    },
    {
      title: 'Calls',
      items: [
        'Making voice calls',
        'Video calling',
        'Group calls',
        'Call settings'
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        'Two-factor authentication',
        'Blocking contacts',
        'Privacy settings',
        'Disappearing messages'
      ]
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Chat with Support',
      subtitle: 'Get help from our support team',
      action: () => toast.success('Opening chat with support...')
    },
    {
      icon: Mail,
      title: 'Email Support',
      subtitle: 'support@chekawak.com',
      action: () => window.open('mailto:support@chekawak.com')
    },
    {
      icon: Phone,
      title: 'Call Support',
      subtitle: '+1 (555) 123-4567',
      action: () => window.open('tel:+15551234567')
    },
    {
      icon: Bug,
      title: 'Report a Bug',
      subtitle: 'Help us improve the app',
      action: () => toast.success('Bug report form opened')
    }
  ];

  const resources = [
    {
      icon: Book,
      title: 'User Guide',
      subtitle: 'Complete guide to using Chekawak',
      action: () => window.open('https://help.chekawak.com/guide', '_blank')
    },
    {
      icon: ExternalLink,
      title: 'Community Forum',
      subtitle: 'Connect with other users',
      action: () => window.open('https://community.chekawak.com', '_blank')
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
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
      </div>

      <div className="pt-6 pb-6 space-y-6">
        {/* FAQ Sections */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {helpSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="px-4 py-3 border-b border-gray-100">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {section.title}
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() => toast.success(`Opening help for: ${item}`)}
                      className={`w-full text-left px-4 py-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item}
                        </span>
                        <ExternalLink className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Contact Support
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {supportOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
              >
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <option.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {option.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {option.subtitle}
                  </p>
                </div>
                <ExternalLink className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Resources
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {resources.map((resource, index) => (
              <button
                key={index}
                onClick={resource.action}
                className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
              >
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <resource.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {resource.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {resource.subtitle}
                  </p>
                </div>
                <ExternalLink className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`mx-4 p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
          <div className="flex items-start">
            <HelpCircle className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-3 mt-0.5 flex-shrink-0`} />
            <div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-2`}>
                Quick Tips
              </h4>
              <ul className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} space-y-1`}>
                <li>• Use the search function to find specific help topics</li>
                <li>• Check our status page for any ongoing issues</li>
                <li>• Join our community forum for user discussions</li>
                <li>• Follow us on social media for updates and tips</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;