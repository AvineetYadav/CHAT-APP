import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, User, Search } from 'lucide-react';
import { userAPI, conversationAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserType {
  _id: string;
  username: string;
  avatar?: string;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await userAPI.searchUsers(searchQuery);
      const filteredResults = response.data.filter(
        (u: UserType) => u._id !== user?._id && !selectedUsers.some(selected => selected._id === u._id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Error searching for users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (selectedUser: UserType) => {
    setSelectedUsers([...selectedUsers, selectedUser]);
    setSearchResults(searchResults.filter(u => u._id !== selectedUser._id));
    setSearchQuery('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (isGroup && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await conversationAPI.createConversation({
        isGroup,
        name: isGroup ? groupName : undefined,
        userIds: selectedUsers.map(u => u._id)
      });
      
      navigate(`/chat/${response.data._id}`);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-dark-200 rounded-xl shadow-xl animate-slide-in overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-light-300 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-light-900 dark:text-dark-100">
            {isGroup ? 'Create Group Chat' : 'New Conversation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex space-x-4 mb-6">
            <Button
              variant={isGroup ? 'ghost' : 'primary'}
              leftIcon={<User size={18} />}
              onClick={() => setIsGroup(false)}
              className="flex-1"
            >
              Direct Message
            </Button>
            <Button
              variant={isGroup ? 'primary' : 'ghost'}
              leftIcon={<Users size={18} />}
              onClick={() => setIsGroup(true)}
              className="flex-1"
            >
              Group Chat
            </Button>
          </div>
          
          {isGroup && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-1">
                Group Name
              </label>
              <input
                type="text"
                className="input w-full bg-light-100 dark:bg-dark-600 text-light-900 dark:text-dark-100"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-1">
              Add People
            </label>
            <div className="relative">
              <input
                type="text"
                className="input w-full pl-10 bg-light-100 dark:bg-dark-600 text-light-900 dark:text-dark-100"
                placeholder="Search by username or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-400" />
              <Button
                onClick={handleSearch}
                isLoading={isSearching}
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                size="sm"
              >
                Search
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-error-100 dark:bg-error-900 text-error-800 dark:text-error-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Search Results
              </h3>
              <div className="max-h-40 overflow-y-auto bg-light-100 dark:bg-dark-600 rounded-lg divide-y divide-light-300 dark:divide-dark-700">
                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="p-3 flex items-center justify-between hover:bg-light-200 dark:hover:bg-dark-500 transition-colors cursor-pointer"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar src={user.avatar} alt={user.username} size="sm" />
                      <span className="text-light-900 dark:text-dark-100">
                        {user.username}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost">Add</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                Selected ({selectedUsers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="inline-flex items-center space-x-2 bg-light-200 dark:bg-dark-600 text-light-900 dark:text-dark-100 px-3 py-1.5 rounded-full text-sm"
                  >
                    <Avatar src={user.avatar} alt={user.username} size="xs" />
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleRemoveUser(user._id)}
                      className="p-1 rounded-full hover:bg-light-300 dark:hover:bg-dark-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-light-300 dark:border-dark-700 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            isLoading={isSubmitting}
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || (isGroup && !groupName.trim())}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;