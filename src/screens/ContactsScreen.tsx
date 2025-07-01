import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserPlus, MoreVertical, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import BottomNavigation from '../components/BottomNavigation';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Contact {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

const API_BASE_URL = '';

const ContactsScreen: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // For now, we'll search for all users as potential contacts
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          params: { search: '' },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessage = async (contact: Contact) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/chats`, {
        participantIds: [contact.id],
        isGroup: false
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate(`/chats/${response.data.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleCall = (contact: Contact) => {
    // For now, navigate to a mock call
    navigate(`/call/${Date.now()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (contact: Contact) => {
    if (contact.status === 'online') return 'Online';
    if (contact.status === 'away') return 'Away';
    return contact.lastSeen ? `Last seen ${contact.lastSeen}` : 'Offline';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        title="Contacts"
        showSearch
        onSearchClick={() => {}}
        rightActions={[
          {
            icon: UserPlus,
            onClick: () => toast.success('Add contact feature coming soon!')
          },
          {
            icon: MoreVertical,
            onClick: () => {}
          }
        ]}
      />

      <div className="pt-16 pb-24">
        {/* Search Bar */}
        <div className="px-4 py-4 bg-white shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            />
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Users className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
            <p className="text-sm text-center">
              {searchQuery ? 'Try a different search term' : 'Search for users to start messaging'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center px-4 py-4 hover:bg-gray-50"
              >
                {/* Avatar */}
                <div className="relative mr-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {contact.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusColor(contact.status)} border-2 border-white rounded-full`}></div>
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{contact.username}</h3>
                  <p className="text-sm text-gray-500 truncate">{getStatusText(contact)}</p>
                  <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMessage(contact)}
                    className="p-2 text-primary-800 hover:bg-primary-100 rounded-full transition-colors duration-200"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCall(contact)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default ContactsScreen;