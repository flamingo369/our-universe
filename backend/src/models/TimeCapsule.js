const mongoose = require('mongoose');

const timeCapsuleSchema = new mongoose.Schema({
  // Author of the capsule
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Recipient (can be both users or specific user)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Title
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Message content
  content: {
    type: String,
    required: true
  },
  // Type of content
  type: {
    type: String,
    enum: ['letter', 'message', 'photo', 'video', 'audio', 'mixed'],
    default: 'letter'
  },
  // Attachments
  attachments: [{
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    name: String
  }],
  // Unlock date (when the capsule can be opened)
  unlockDate: {
    type: Date,
    required: true
  },
  // Status
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'opened', 'expired'],
    default: 'locked'
  },
  // When it was opened
  openedAt: {
    type: Date
  },
  // Occasion/Reason
  occasion: {
    type: String,
    enum: [
      'anniversary',
      'birthday',
      'special_day',
      'just_because',
      'future_self',
      'memory',
      'surprise',
      'milestone',
      'other'
    ],
    default: 'special_day'
  },
  // Mood/emoji
  mood: {
    type: String,
    default: '💌'
  },
  // Reminder sent
  reminderSent: {
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
timeCapsuleSchema.index({ unlockDate: 1 });
timeCapsuleSchema.index({ author: 1, status: 1 });
timeCapsuleSchema.index({ recipient: 1, status: 1 });

// Virtual for checking if capsule can be opened
timeCapsuleSchema.virtual('canOpen').get(function() {
  return new Date() >= new Date(this.unlockDate) && this.status !== 'opened';
});

// Virtual for days until unlock
timeCapsuleSchema.virtual('daysUntilUnlock').get(function() {
  const diff = new Date(this.unlockDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for formatted unlock date
timeCapsuleSchema.virtual('formattedUnlockDate').get(function() {
  return new Date(this.unlockDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for time remaining
timeCapsuleSchema.virtual('timeRemaining').get(function() {
  const diff = new Date(this.unlockDate) - new Date();
  if (diff <= 0) return 'Ready to open!';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return 'Almost ready!';
});

// Method to open the capsule
timeCapsuleSchema.methods.open = function() {
  if (new Date() < new Date(this.unlockDate)) {
    throw new Error('Cannot open capsule before unlock date');
  }
  this.status = 'opened';
  this.openedAt = new Date();
  return this.save();
};

const TimeCapsule = mongoose.model('TimeCapsule', timeCapsuleSchema);

module.exports = TimeCapsule;