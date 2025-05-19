import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatMessageTime, isImageUrl, isGif } from '../../utils/helpers';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  image?: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  conversationName: string;
  participants: any[];
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  conversationName,
  participants
}) => {
  const { user } = useAuth();
  const { isTyping, onlineUsers } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id: conversationId = '' } = { id: window.location.pathname.split('/').pop() };
  
  const typingUsers = isTyping[conversationId] || [];
  
  const typingUsernames = typingUsers
    .filter(userId => userId !== user?._id)
    .map(userId => {
      const participant = participants.find(p => p._id === userId);
      return participant?.username || 'Someone';
    });

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsernames]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
          <MessageCircle size={32} className="text-primary-500" />
        </div>
        <h3 className="text-xl font-medium text-light-900 dark:text-dark-900 mb-2">
          No messages yet
        </h3>
        <p className="text-light-500 dark:text-dark-500 max-w-md">
          Send a message to start the conversation with {conversationName}
        </p>
      </div>
    );
  }

  const renderMessage = (message: Message, index: number, messages: Message[]) => {
    const isUser = message.sender._id === user?._id;
    const showAvatar = !isUser;
    const showUsername = !isUser && (index === 0 || messages[index - 1].sender._id !== message.sender._id);
    
    return (
      <div key={message._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%] group`}>
          {!isUser && (
            <div className="flex-shrink-0 mr-2">
              <Avatar 
                src={message.sender.avatar} 
                alt={message.sender.username} 
                size="sm" 
                status={onlineUsers.includes(message.sender._id) ? 'online' : null}
              />
            </div>
          )}
          
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {showUsername && (
              <span className="text-xs text-light-500 dark:text-dark-400 mb-1 ml-1">
                {message.sender.username}
              </span>
            )}
            
            <div 
              className={`
                rounded-2xl px-4 py-2 shadow-sm
                ${isUser 
                  ? 'bg-primary-500 text-white rounded-br-none' 
                  : 'bg-light-200 dark:bg-dark-700 text-light-900 dark:text-dark-100 rounded-bl-none'
                }
              `}
            >
              {message.image && (
                <div className="mb-2">
                  {isGif(message.image) ? (
                    <img 
                      src={message.image} 
                      alt="GIF" 
                      className="max-w-full rounded-lg max-h-60 object-contain"
                    />
                  ) : isImageUrl(message.image) ? (
                    <img 
                      src={message.image} 
                      alt="Image" 
                      className="max-w-full rounded-lg max-h-60 object-contain"
                    />
                  ) : (
                    <a 
                      href={message.image} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`text-${isUser ? 'white' : 'primary-500'} underline`}
                    >
                      {message.image}
                    </a>
                  )}
                </div>
              )}
              
              {message.content && (
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
              )}
              
              <span className={`text-xs ${isUser ? 'text-white/70' : 'text-light-500 dark:text-dark-400'} ml-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-light-100 dark:bg-dark-800">
      <div className="space-y-1">
        {messages.map((message, index, messages) => renderMessage(message, index, messages))}
      </div>
      
      {typingUsernames.length > 0 && (
        <div className="flex items-center my-2">
          <div className="flex space-x-1 mr-2">
            <span className="w-1.5 h-1.5 bg-light-500 dark:bg-dark-400 rounded-full animate-typing delay-0"></span>
            <span className="w-1.5 h-1.5 bg-light-500 dark:bg-dark-400 rounded-full animate-typing delay-150"></span>
            <span className="w-1.5 h-1.5 bg-light-500 dark:bg-dark-400 rounded-full animate-typing delay-300"></span>
          </div>
          <p className="text-sm text-light-500 dark:text-dark-400">
            {typingUsernames.length === 1
              ? `${typingUsernames[0]} is typing...`
              : `${typingUsernames.join(', ')} are typing...`}
          </p>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;