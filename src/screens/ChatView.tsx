import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, Phone, Video, MoreVertical, Smile, Image, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import NavBar from '../components/NavBar';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  chatId: number;
  content: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  isEdited: boolean;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface Chat {
  id: number;
  name?: string;
  isGroup: boolean;
  participants: Array<{
    id: number;
    username: string;
    status: string;
    avatar?: string;
    lastSeen: string;
  }>;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const ChatView: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch chat and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!chatId) return;

      try {
        const token = localStorage.getItem('token');
        const [chatResponse, messagesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/chats/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/messages/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setChat(chatResponse.data);
        setMessages(messagesResponse.data);
      } catch (error: any) {
        console.error('Error fetching chat data:', error);
        if (error.response?.status === 403) {
          toast.error('You do not have access to this chat');
        } else {
          toast.error('Failed to load chat');
        }
        navigate('/chats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chatId, navigate]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (message: Message) => {
      if (message.chatId === parseInt(chatId)) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTypingStarted = (data: { chatId: number; userId: number; username: string }) => {
      if (data.chatId === parseInt(chatId) && data.userId !== user?.id) {
        setTypingUsers(prev => 
          prev.includes(data.username) ? prev : [...prev, data.username]
        );
      }
    };

    const handleTypingStopped = (data: { chatId: number; userId: number; username: string }) => {
      if (data.chatId === parseInt(chatId)) {
        setTypingUsers(prev => prev.filter(username => username !== data.username));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_started', handleTypingStarted);
    socket.on('typing_stopped', handleTypingStopped);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_started', handleTypingStarted);
      socket.off('typing_stopped', handleTypingStopped);
    };
  }, [socket, chatId, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing indicators
  const handleTyping = () => {
    if (!socket || !chatId) return;

    socket.emit('typing_start', { chatId: parseInt(chatId) });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { chatId: parseInt(chatId) });
    }, 1000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !socket || !chatId) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing_stop', { chatId: parseInt(chatId) });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/messages/${chatId}`, {
        content: messageContent,
        type: 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit via socket for real-time delivery
      socket.emit('send_message', {
        chatId: parseInt(chatId),
        content: messageContent,
        type: 'text'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !chatId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type.startsWith('image/') ? 'image' : 'file');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/messages/${chatId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('send_message', response.data);
      }

      toast.success('File sent successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to send file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initiateCall = async (type: 'audio' | 'video') => {
    if (!chatId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/calls`, {
        chatId: parseInt(chatId),
        type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit call invitation via socket
      if (socket) {
        socket.emit('call_invite', {
          chatId: parseInt(chatId),
          callId: response.data.id,
          type
        });
      }

      navigate(`/call/${response.data.id}`);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to start call');
    }
  };

  // Get chat display info
  const getChatInfo = () => {
    if (!chat) return { name: '', subtitle: '' };

    if (chat.isGroup) {
      const onlineCount = chat.participants.filter(u => u.status === 'online').length;
      return {
        name: chat.name || 'Group Chat',
        subtitle: `${chat.participants.length} members${onlineCount > 0 ? `, ${onlineCount} online` : ''}`
      };
    }

    const otherUser = chat.participants.find(u => u.id !== user?.id);
    if (!otherUser) return { name: 'Unknown User', subtitle: '' };

    return {
      name: otherUser.username,
      subtitle: otherUser.status === 'online' 
        ? 'Online' 
        : `Last seen ${new Date(otherUser.lastSeen).toLocaleString()}`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat not found</h2>
          <button
            onClick={() => navigate('/chats')}
            className="text-primary-800 hover:text-primary-700"
          >
            Back to chats
          </button>
        </div>
      </div>
    );
  }

  const { name, subtitle } = getChatInfo();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar
        title={name}
        subtitle={subtitle}
        onBack={() => navigate('/chats')}
        rightActions={[
          { icon: Phone, onClick: () => initiateCall('audio') },
          { icon: Video, onClick: () => initiateCall('video') },
          { icon: MoreVertical, onClick: () => {/* Handle menu */} }
        ]}
      />

      {/* Messages */}
      <div className="flex-1 pt-20 pb-24 overflow-y-auto custom-scrollbar bg-gray-50">
        <div className="px-4 py-6 space-y-4">
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender.id === user?.id}
            />
          ))}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <form onSubmit={sendMessage} className="flex items-end space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Message..."
              className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200 resize-none"
              disabled={sending}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 rounded-full transition-colors duration-200"
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-primary-800 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;