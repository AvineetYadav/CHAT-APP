import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isTyping: { [conversationId: string]: string[] };
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<{ [conversationId: string]: string[] }>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const newSocket = io('http://localhost:5000', {
        query: { userId: user._id },
        withCredentials: true,
      });

      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('onlineUsers', (users: string[]) => {
        setOnlineUsers(users);
      });

      newSocket.on('userStartedTyping', ({ conversationId, userId }) => {
        setIsTyping(prev => {
          const typingUsers = prev[conversationId] || [];
          if (!typingUsers.includes(userId)) {
            return {
              ...prev,
              [conversationId]: [...typingUsers, userId]
            };
          }
          return prev;
        });
      });

      newSocket.on('userStoppedTyping', ({ conversationId, userId }) => {
        setIsTyping(prev => {
          const typingUsers = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: typingUsers.filter(id => id !== userId)
          };
        });
      });

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const startTyping = (conversationId: string) => {
    if (socket && user) {
      socket.emit('typing', { conversationId, userId: user._id });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket && user) {
      socket.emit('stopTyping', { conversationId, userId: user._id });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isTyping,
        startTyping,
        stopTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;