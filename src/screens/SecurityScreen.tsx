import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, Smartphone, Key, AlertTriangle, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const SecurityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    appLock: false,
    fingerprintLock: true,
    showSecurityNotifications: true,
    activeSessions: 3
  });

  const securityOptions = [
    {
      icon: Key,
      title: 'Two-step verification',
      subtitle: settings.twoFactorAuth ? 'Enabled' : 'Disabled',
      description: 'Add extra security to your account',
      action: () => {
        setSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }));
        toast.success(settings.twoFactorAuth ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled');
      },
      toggle: true,
      enabled: settings.twoFactorAuth
    },
    {
      icon: Lock,
      title: 'App lock',
      subtitle: settings.appLock ? 'Enabled' : 'Disabled',
      description: 'Require authentication to open the app',
      action: () => {
        setSettings(prev => ({ ...prev, appLock: !prev.appLock }));
        toast.success(settings.appLock ? 'App lock disabled' : 'App lock enabled');
      },
      toggle: true,
      enabled: settings.appLock
    },
    {
      icon: Smartphone,
      title: 'Fingerprint unlock',
      subtitle: settings.fingerprintLock ? 'Enabled' : 'Disabled',
      description: 'Use fingerprint to unlock the app',
      action: () => {
        setSettings(prev => ({ ...prev, fingerprintLock: !prev.fingerprintLock }));
        toast.success(settings.fingerprintLock ? 'Fingerprint unlock disabled' : 'Fingerprint unlock enabled');
      },
      toggle: true,
      enabled: settings.fingerprintLock
    },
    {
      icon: Shield,
      title: 'Security notifications',
      subtitle: settings.showSecurityNotifications ? 'Enabled' : 'Disabled',
      description: 'Get notified about security events',
      action: () => {
        setSettings(prev => ({ ...prev, showSecurityNotifications: !prev.showSecurityNotifications }));
        toast.success('Security notifications setting updated');
      },
      toggle: true,
      enabled: settings.showSecurityNotifications
    }
  ];

  const securityActions = [
    {
      icon: Lock,
      title: 'Change password',
      subtitle: 'Update your account password',
      action: () => navigate('/settings/security/password')
    },
    {
      icon: Smartphone,
      title: 'Active sessions',
      subtitle: `${settings.activeSessions} active sessions`,
      action: () => navigate('/settings/security/sessions')
    },
    {
      icon: AlertTriangle,
      title: 'Security checkup',
      subtitle: 'Review your security settings',
      action: () => navigate('/settings/security/checkup')
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
          <h1 className="text-xl font-bold">Security</h1>
        </div>
      </div>

      <div className="pt-6 pb-6 space-y-6">
        {/* Security Settings */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Security Settings
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {securityOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                    <option.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {option.title}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {option.description}
                    </p>
                  </div>
                </div>
                <div 
                  onClick={option.action}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                    option.enabled ? 'bg-primary-800' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                    option.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Security */}
        <div>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} px-4 mb-3 uppercase tracking-wide`}>
            Account Security
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {securityActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`w-full flex items-center px-4 py-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
              >
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                  <action.icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {action.subtitle}
                  </p>
                </div>
                <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <div className={`mx-4 p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
          <div className="flex items-start">
            <Shield className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-3 mt-0.5 flex-shrink-0`} />
            <div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-2`}>
                Security Tips
              </h4>
              <ul className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} space-y-1`}>
                <li>• Enable two-factor authentication for extra security</li>
                <li>• Use a strong, unique password</li>
                <li>• Regularly review your active sessions</li>
                <li>• Keep your app updated to the latest version</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityScreen;