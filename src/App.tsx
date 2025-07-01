import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChatsScreen from './screens/ChatsScreen';
import ChatView from './screens/ChatView';
import CallScreen from './screens/CallScreen';
import CallsScreen from './screens/CallsScreen';
import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import SecurityScreen from './screens/SecurityScreen';
import StorageScreen from './screens/StorageScreen';
import HelpScreen from './screens/HelpScreen';
import AboutScreen from './screens/AboutScreen';
import NewChatModal from './components/NewChatModal';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/chats" />;
}

function AppContent() {
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterScreen />
            </PublicRoute>
          } 
        />
        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <SocketProvider>
                <ChatsScreen />
              </SocketProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chats/:chatId" 
          element={
            <ProtectedRoute>
              <SocketProvider>
                <ChatView />
              </SocketProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calls" 
          element={
            <ProtectedRoute>
              <SocketProvider>
                <CallsScreen />
              </SocketProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/call/:callId" 
          element={
            <ProtectedRoute>
              <SocketProvider>
                <CallScreen />
              </SocketProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/contacts" 
          element={
            <ProtectedRoute>
              <ContactsScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/profile" 
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/privacy" 
          element={
            <ProtectedRoute>
              <PrivacyScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/security" 
          element={
            <ProtectedRoute>
              <SecurityScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/storage" 
          element={
            <ProtectedRoute>
              <StorageScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/help" 
          element={
            <ProtectedRoute>
              <HelpScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings/about" 
          element={
            <ProtectedRoute>
              <AboutScreen />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <SearchScreen />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/chats" />} />
      </Routes>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <AppContent />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;