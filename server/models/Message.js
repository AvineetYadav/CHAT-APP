import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Ensure that a message has either content or image
MessageSchema.pre('save', function(next) {
  if (!this.content && !this.image) {
    return next(new Error('Message must have either text content or an image'));
  }
  next();
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;