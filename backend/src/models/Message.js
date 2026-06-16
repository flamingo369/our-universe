const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'emoji', 'system'],
    default: 'text'
  },
  // For image messages
  imageUrl: {
    type: String
  },
  imagePublicId: {
    type: String
  },
  // Room identifier (combination of both user IDs)
  room: {
    type: String,
    required: true
  },
  // Read status
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String
    }
  }],
  // Edited flag
  isEdited: {
    type: Boolean,
    default: false
  },
  // Deleted flag (soft delete)
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Virtual for formatted time
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;