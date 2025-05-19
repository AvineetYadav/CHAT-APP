import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    // Find all conversations the user is part of
    const conversations = await Conversation.find({
      participants: { $elemMatch: { $eq: req.user.id } }
    })
      .populate('participants', 'username avatar')
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single conversation
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username avatar')
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new conversation
export const createConversation = async (req, res) => {
  try {
    const { isGroup, name, userIds } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one user' });
    }

    // Add current user to participants if not already included
    const participants = [...userIds];
    if (!participants.includes(req.user.id)) {
      participants.push(req.user.id);
    }

    // For direct messages, check if conversation already exists
    if (!isGroup && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      })
        .populate('participants', 'username avatar')
        .populate({
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: 'username'
          }
        });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    // Create new conversation
    const newConversation = new Conversation({
      isGroup,
      participants,
      name: isGroup ? name : undefined,
      admin: isGroup ? req.user.id : undefined
    });

    const savedConversation = await newConversation.save();

    // Populate participants
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate('participants', 'username avatar');

    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update conversation (group name or image)
export const updateConversation = async (req, res) => {
  try {
    const { name, groupImage } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (groupImage) updateData.groupImage = groupImage;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Only group conversations can be updated
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Cannot update direct message conversation' });
    }

    // Check if user is admin
    if (conversation.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only group admin can update group details' });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('participants', 'username avatar');

    res.json(updatedConversation);
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // For group chats, only admin can delete
    if (conversation.isGroup && conversation.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only group admin can delete the group' });
    }

    // For direct messages, any participant can delete (only deletes for them)
    if (!conversation.isGroup && !conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: req.params.id });

    // Delete the conversation
    await Conversation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add user to group conversation
export const addUserToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Cannot add users to direct message' });
    }

    // Check if user is admin
    if (conversation.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only group admin can add users' });
    }

    // Check if user is already in the group
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ message: 'User is already in the group' });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add user to group
    conversation.participants.push(userId);
    await conversation.save();

    const updatedConversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username avatar');

    res.json(updatedConversation);
  } catch (error) {
    console.error('Add user to group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove user from group conversation
export const removeUserFromGroup = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Cannot remove users from direct message' });
    }

    // Check if requester is admin or if the user is removing themselves
    if (conversation.admin.toString() !== req.user.id && req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to remove users' });
    }

    // Admin cannot be removed
    if (userId === conversation.admin.toString() && req.user.id !== userId) {
      return res.status(400).json({ message: 'Cannot remove the group admin' });
    }

    // Check if user is in the group
    if (!conversation.participants.some(p => p.toString() === userId)) {
      return res.status(400).json({ message: 'User is not in the group' });
    }

    // Remove user from group
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== userId
    );

    // If admin leaves, assign a new admin or delete the group if empty
    if (userId === conversation.admin.toString()) {
      if (conversation.participants.length > 0) {
        conversation.admin = conversation.participants[0];
      } else {
        // Delete the conversation if no participants left
        await Conversation.findByIdAndDelete(req.params.id);
        await Message.deleteMany({ conversation: req.params.id });
        return res.json({ message: 'Group deleted as no participants remain' });
      }
    }

    await conversation.save();

    const updatedConversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username avatar');

    res.json(updatedConversation);
  } catch (error) {
    console.error('Remove user from group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};