import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { uploadImage } from '../utils/fileUpload.js';
import { getIo } from '../utils/socket.js';

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }
    
    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
    
    // Mark messages as read by this user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );
    
    // Notify other users that messages have been read
    const io = getIo();
    if (io) {
      io.to(conversationId).emit('messageRead', {
        conversationId,
        userId: req.user.id
      });
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { content, conversationId, image } = req.body;
    
    // Validate input
    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }
    
    if (!content && !image) {
      return res.status(400).json({ message: 'Message content or image is required' });
    }
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send message to this conversation' });
    }
    
    // Create new message
    const newMessage = new Message({
      sender: req.user.id,
      content,
      image,
      conversation: conversationId,
      readBy: [req.user.id] // Marked as read by sender
    });
    
    const savedMessage = await newMessage.save();
    
    // Update conversation with latest message
    conversation.latestMessage = savedMessage._id;
    await conversation.save();
    
    // Populate sender info for response
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'username avatar');
    
    // Emit socket event
    const io = getIo();
    if (io) {
      io.to(conversationId).emit('newMessage', populatedMessage);
    }
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only the sender can delete their message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    // Check if this is the latest message in the conversation
    const conversation = await Conversation.findById(message.conversation);
    if (conversation && conversation.latestMessage && 
        conversation.latestMessage.toString() === req.params.id) {
      // Find the previous message to set as latest
      const previousMessage = await Message.findOne({
        conversation: message.conversation,
        _id: { $ne: req.params.id }
      }).sort({ createdAt: -1 });
      
      if (previousMessage) {
        conversation.latestMessage = previousMessage._id;
      } else {
        conversation.latestMessage = null;
      }
      
      await conversation.save();
    }
    
    await Message.findByIdAndDelete(req.params.id);
    
    // Emit socket event
    const io = getIo();
    if (io) {
      io.to(message.conversation.toString()).emit('messageDeleted', {
        messageId: req.params.id,
        conversationId: message.conversation
      });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload image
export const uploadMessageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Upload image to storage
    const imageUrl = await uploadImage(req.file);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload message image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};