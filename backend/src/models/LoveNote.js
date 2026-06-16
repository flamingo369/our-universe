const mongoose = require('mongoose');

const loveNoteSchema = new mongoose.Schema({
  // Author of the note
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Note content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280 // Like a tweet length
  },
  // Note color (for sticky note appearance)
  color: {
    type: String,
    enum: [
      'yellow',
      'pink',
      'blue',
      'green',
      'purple',
      'orange',
      'red',
      'white'
    ],
    default: 'yellow'
  },
  // Position on the board (x, y coordinates as percentages)
  position: {
    x: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    y: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // Rotation angle for natural look
  rotation: {
    type: Number,
    default: 0,
    min: -15,
    max: 15
  },
  // Size
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  // Mood/emoji
  mood: {
    type: String,
    default: '❤️'
  },
  // Category
  category: {
    type: String,
    enum: [
      'love',
      'good_morning',
      'good_night',
      'miss_you',
      'thinking_of_you',
      'encouragement',
      'thank_you',
      'sorry',
      'celebration',
      'random',
      'quote'
    ],
    default: 'love'
  },
  // Is this note pinned/featured
  isPinned: {
    type: Boolean,
    default: false
  },
  // isActive flag
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
loveNoteSchema.index({ author: 1, createdAt: -1 });
loveNoteSchema.index({ category: 1, isPinned: -1 });
loveNoteSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for formatted time
loveNoteSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return created.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
});

const LoveNote = mongoose.model('LoveNote', loveNoteSchema);

module.exports = LoveNote;