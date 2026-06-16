const mongoose = require('mongoose');

const bucketListSchema = new mongoose.Schema({
  // Title of the goal
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Detailed description
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Category
  category: {
    type: String,
    enum: [
      'travel',
      'experience',
      'milestone',
      'gift',
      'surprise',
      'adventure',
      'romantic',
      'fun',
      'learning',
      'other'
    ],
    default: 'experience'
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Target/completion date
  targetDate: {
    type: Date
  },
  // Actual completion date
  completedAt: {
    type: Date
  },
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Completed by (which user marked it complete)
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Related photos (memories from completing this)
  photos: [{
    url: String,
    publicId: String,
    thumbnailUrl: String
  }],
  // Location (for travel goals)
  location: {
    country: String,
    city: String
  },
  // Coordinates
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  // Estimated cost (optional)
  estimatedCost: {
    type: Number,
    default: 0
  },
  // Notes
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // Mood/emoji
  mood: {
    type: String,
    default: '⭐'
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
bucketListSchema.index({ status: 1, priority: -1 });
bucketListSchema.index({ createdBy: 1, status: 1 });
bucketListSchema.index({ category: 1 });

// Virtual for progress percentage
bucketListSchema.virtual('progress').get(function() {
  switch(this.status) {
    case 'pending': return 0;
    case 'in_progress': return 50;
    case 'completed': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
});

// Virtual for formatted target date
bucketListSchema.virtual('formattedTargetDate').get(function() {
  if (this.targetDate) {
    return new Date(this.targetDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return null;
});

// Virtual for days until target
bucketListSchema.virtual('daysUntilTarget').get(function() {
  if (this.targetDate && this.status !== 'completed') {
    const diff = new Date(this.targetDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Method to mark as completed
bucketListSchema.methods.markCompleted = function(userId) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.completedBy = userId;
  return this.save();
};

const BucketList = mongoose.model('BucketList', bucketListSchema);

module.exports = BucketList;