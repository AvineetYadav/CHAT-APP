import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatConversationDate, truncateText } from '../../utils/helpers';

interface Conversation {
  _id: string;
  name: string;
  isGroup: boolean;
  groupImage?: string;
  participants: {
    _id: string;
    username: string;
    avatar?: string;
  }[];
  latestMessage?: {
    content: string;
    sender: {
      _id: string;
      username: string;
    };
    createdAt: string;
    read: boolean;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, isLoading }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-light-600 dark:text-dark-400">No conversations yet</p>
        <p className="text-sm text-light-500 dark:text-dark-500 mt-1">
          Start a new conversation to begin chatting
        </p>
      </div>
    );
  }

  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name;
    } else {
      const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
      return otherParticipant?.username || 'Unknown User';
    }
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.groupImage;
    } else {
      const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
      return otherParticipant?.avatar;
    }
  };

  const getOnlineStatus = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return null;
    } else {
      const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
      return otherParticipant && onlineUsers.includes(otherParticipant._id) ? 'online' : 'offline';
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.latestMessage) return 'No messages yet';
    
    const isSentByUser = conversation.latestMessage.sender._id === user?._id;
    const prefix = isSentByUser ? 'You: ' : '';
    
    return prefix + truncateText(conversation.latestMessage.content, 30);
  };

  return (
    <div className="divide-y divide-light-300 dark:divide-dark-700">
      {conversations.map((conversation) => {
        const isActive = conversation._id === id;
        const hasUnread = conversation.latestMessage && 
                          !conversation.latestMessage.read && 
                          conversation.latestMessage.sender._id !== user?._id;
        
        return (
          <div
            key={conversation._id}
            className={`p-4 cursor-pointer transition-colors hover:bg-light-200 dark:hover:bg-dark-300 
              ${isActive ? 'bg-light-200 dark:bg-dark-300' : ''}`}
            onClick={() => navigate(`/chat/${conversation._id}`)}
          >
            <div className="flex items-center space-x-3">
              <Avatar
                src={getConversationAvatar(conversation)}
                alt={getConversationName(conversation)}
                status={getOnlineStatus(conversation)}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate text-light-900 dark:text-dark-900">
                    {getConversationName(conversation)}
                  </h3>
                  {conversation.latestMessage && (
                    <span className="text-xs text-light-500 dark:text-dark-500 whitespace-nowrap ml-2">
                      {formatConversationDate(conversation.latestMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-sm truncate ${
                    hasUnread 
                      ? 'font-medium text-light-800 dark:text-dark-200' 
                      : 'text-light-500 dark:text-dark-500'
                  }`}>
                    {getLastMessagePreview(conversation)}
                  </p>
                  
                  {hasUnread && (
                    <span className="ml-2 flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;