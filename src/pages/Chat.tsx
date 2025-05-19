import React, { useEffect, useState } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { conversationAPI, messageAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Sidebar from '../components/chat/Sidebar';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ChatPlaceholder = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-light-100 dark:bg-dark-300">
    <div className="text-center">
      <h3 className="text-xl font-medium text-light-900 dark:text-dark-900 mb-2">
        Select a conversation
      </h3>
      <p className="text-light-500 dark:text-dark-500 max-w-md">
        Choose a contact or group from the sidebar to start messaging
      </p>
    </div>
  </div>
);

const ChatArea = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch conversation details
  const { 
    data: conversation,
    isLoading: isLoadingConversation,
  } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await conversationAPI.getConversation(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch messages
  const { 
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await messageAPI.getMessages(id);
      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('newMessage', (message) => {
        if (message.conversation === id) {
          refetchMessages();
        }
        
        // Update the conversation list to show the latest message
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });

      // Listen for message read status updates
      socket.on('messageRead', (data) => {
        if (data.conversationId === id) {
          refetchMessages();
        }
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageRead');
      };
    }
  }, [socket, id, refetchMessages, queryClient]);

  if (!id) {
    return <ChatPlaceholder />;
  }

  if (isLoadingConversation) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-light-600 dark:text-dark-400">Conversation not found</p>
      </div>
    );
  }

  const getConversationName = () => {
    if (conversation.isGroup) {
      return conversation.name;
    } else {
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      return otherUser?.username || 'Unknown User';
    }
  };

  const getConversationStatus = () => {
    if (conversation.isGroup) {
      return `${conversation.participants.length} members`;
    } else {
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      if (otherUser && onlineUsers.includes(otherUser._id)) {
        return 'Online';
      }
      return 'Offline';
    }
  };

  const getConversationAvatar = () => {
    if (conversation.isGroup) {
      return conversation.groupImage;
    } else {
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      return otherUser?.avatar;
    }
  };

  const getConversationStatusIndicator = () => {
    if (conversation.isGroup) {
      return null;
    } else {
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      return otherUser && onlineUsers.includes(otherUser._id) ? 'online' : 'offline';
    }
  };

  const handleSendMessage = () => {
    refetchMessages();
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-dark-300">
      {/* Chat Header */}
      <div className="flex items-center px-4 py-3 border-b border-light-300 dark:border-dark-700 bg-white dark:bg-dark-200">
        <div className="md:hidden mr-2">
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1 rounded-md hover:bg-light-200 dark:hover:bg-dark-300"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        <Avatar 
          src={getConversationAvatar()}
          alt={getConversationName()}
          status={getConversationStatusIndicator()}
        />
        
        <div className="ml-3 flex-1">
          <h2 className="font-semibold text-light-900 dark:text-dark-900">
            {getConversationName()}
          </h2>
          <p className="text-xs text-light-500 dark:text-dark-500">
            {getConversationStatus()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-300">
            <Phone size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-300">
            <Video size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-300">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <MessageList 
        messages={messages} 
        isLoading={isLoadingMessages}
        conversationName={getConversationName()}
        participants={conversation.participants}
      />
      
      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

const Chat: React.FC = () => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - hidden on mobile by default */}
      <div className="hidden md:block md:w-80 lg:w-96 h-full">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/:id" element={<ChatArea />} />
          <Route path="/" element={<ChatPlaceholder />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Chat;