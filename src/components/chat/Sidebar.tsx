import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageSquare, Settings, Search, Plus, LogOut } from 'lucide-react';
import { conversationAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../ui/Avatar';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import ConversationList from './ConversationList';
import NewConversationModal from './NewConversationModal';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [activeTab, setActiveTab] = useState<'chats' | 'users' | 'settings'>('chats');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await conversationAPI.getConversations();
      return response.data;
    },
  });

  useEffect(() => {
    // Extract tab from URL path
    const path = location.pathname;
    if (path.includes('/chat/settings')) {
      setActiveTab('settings');
    } else if (path.includes('/chat/users')) {
      setActiveTab('users');
    } else {
      setActiveTab('chats');
    }
  }, [location]);

  const handleTabChange = (tab: 'chats' | 'users' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'chats') {
      navigate('/chat');
    } else if (tab === 'users') {
      navigate('/chat/users');
    } else if (tab === 'settings') {
      navigate('/chat/settings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openNewConversationModal = () => {
    setIsNewConversationModalOpen(true);
  };

  const closeNewConversationModal = () => {
    setIsNewConversationModalOpen(false);
    refetch();
  };

  const filteredConversations = conversations?.filter(
    (conversation: any) => 
      conversation.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.latestMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (!conversation.isGroup && 
       conversation.participants.find((p: any) => p._id !== user?._id)?.username
         .toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-200 border-r border-light-300 dark:border-dark-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-light-300 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={user?.avatar}
              alt={user?.username || 'User'} 
              status={onlineUsers.includes(user?._id || '') ? 'online' : 'offline'}
            />
            <div>
              <h2 className="font-semibold text-light-900 dark:text-dark-900">
                {user?.username}
              </h2>
              <p className="text-xs text-light-500 dark:text-dark-500">
                {onlineUsers.includes(user?._id || '') ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle iconOnly />
            <button 
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-light-200 dark:hover:bg-dark-300"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-light-300 dark:border-dark-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500 dark:text-dark-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 pr-4 py-2 w-full bg-light-200 dark:bg-dark-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-light-300 dark:border-dark-700">
        <button
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'chats' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-light-600 dark:text-dark-400 hover:text-light-900 dark:hover:text-dark-200'
          }`}
          onClick={() => handleTabChange('chats')}
        >
          <MessageSquare size={18} className="inline mr-1" />
          Chats
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'users'
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-light-600 dark:text-dark-400 hover:text-light-900 dark:hover:text-dark-200'
          }`}
          onClick={() => handleTabChange('users')}
        >
          <Users size={18} className="inline mr-1" />
          Users
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium ${
            activeTab === 'settings'
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-light-600 dark:text-dark-400 hover:text-light-900 dark:hover:text-dark-200'
          }`}
          onClick={() => handleTabChange('settings')}
        >
          <Settings size={18} className="inline mr-1" />
          Settings
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' && (
          <>
            <div className="p-4">
              <Button 
                variant="primary" 
                fullWidth 
                leftIcon={<Plus size={16} />}
                onClick={openNewConversationModal}
              >
                New Conversation
              </Button>
            </div>
            <ConversationList 
              conversations={filteredConversations || []} 
              isLoading={isLoading} 
            />
          </>
        )}
        
        {activeTab === 'users' && (
          <div className="p-4 text-center text-light-600 dark:text-dark-400">
            Users tab content will go here
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4 text-center text-light-600 dark:text-dark-400">
            Settings tab content will go here
          </div>
        )}
      </div>
      
      {/* New Conversation Modal */}
      {isNewConversationModalOpen && (
        <NewConversationModal 
          isOpen={isNewConversationModalOpen}
          onClose={closeNewConversationModal}
        />
      )}
    </div>
  );
};

export default Sidebar;