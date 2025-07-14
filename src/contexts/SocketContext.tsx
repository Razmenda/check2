import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      console.log('🔌 Connecting to socket server...');
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to socket server');
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Connected to server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from socket server:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('💥 Socket connection error:', error);
        setIsConnected(false);
        setConnectionError(error.message);
        
        if (error.message.includes('Authentication')) {
          toast.error('Authentication failed. Please login again.');
        } else {
          toast.error('Connection failed. Retrying...');
        }
      });

      newSocket.on('error', (error) => {
        console.error('💥 Socket error:', error);
        setConnectionError(error.message || 'Socket error occurred');
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Reconnected to server');
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('💥 Reconnection error:', error);
        setConnectionError('Reconnection failed');
      });

      newSocket.on('reconnect_failed', () => {
        console.error('💥 Failed to reconnect');
        setConnectionError('Failed to reconnect to server');
        toast.error('Unable to connect to server');
      });

      // Debug socket events in development
      if (import.meta.env.DEV) {
        newSocket.onAny((event, ...args) => {
          console.log('📡 Socket event:', event, args);
        });
      }

      setSocket(newSocket);

      return () => {
        console.log('🔌 Cleaning up socket connection...');
        newSocket.close();
      };
    } else {
      if (socket) {
        console.log('🔌 Closing socket connection (no auth)...');
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setConnectionError(null);
      }
    }
  }, [token, user]);

  const value = {
    socket,
    isConnected,
    connectionError,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};