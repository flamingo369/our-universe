const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  // Title of the memory
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Detailed description
  description: {
    type: String,
    required: true
  },
  // Date when this memory happened
  memoryDate: {
    type: Date,
    required: true
  },
  // Related photos
  photos: [{
    url: String,
    publicId: String,
    thumbnailUrl: String,
    caption: String
  }],
  // Location
  location: {
    type: String,
    trim: true
  },
  // Coordinates for map
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Category/Type
  category: {
    type: String,
    enum: [
      'first',
      'trip',
      'celebration',
      'everyday',
      'surprise',
      'gift',
      'call',
      'message',
      'video_call',
      'special',
      'other'
    ],
    default: 'special'
  },
  // Mood/Feeling
  mood: {
    type: String,
    default: '❤️'
  },
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  // Is this memory featured
  isFeatured: {
    type: Boolean,
    default: false
  },
  // isActive flag
  isActive: {
    type: Boolean,
    default: true
  },
  // Privacy (for future expansion)
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
memorySchema.index({ memoryDate: -1 });
memorySchema.index({ category: 1, isFeatured: 1 });
memorySchema.index({ createdBy: 1, memoryDate: -1 });

// Virtual for formatted date
memorySchema.virtual('formattedDate').get(function() {
  return new Date(this.memoryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for short excerpt
memorySchema.virtual('excerpt').get(function() {
  return this.description.length > 150 
    ? this.description.substring(0, 150) + '...' 
    : this.description;
});

const Memory = mongoose.model('Memory', memorySchema);

module.exports = Memory;