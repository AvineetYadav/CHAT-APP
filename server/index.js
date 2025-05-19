import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';

// Middleware
import { verifyToken } from './middleware/auth.js';

// Config
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/conversations', verifyToken, conversationRoutes);
app.use('/api/messages', verifyToken, messageRoutes);

// Socket.io connection
const onlineUsers = new Set();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Add user to online users when they connect
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.add(userId);
    io.emit('onlineUsers', Array.from(onlineUsers));
  }
  
  // Handle joining conversation rooms
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });
  
  // Handle typing indicators
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('userStartedTyping', { conversationId, userId });
  });
  
  socket.on('stopTyping', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('userStoppedTyping', { conversationId, userId });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers));
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;