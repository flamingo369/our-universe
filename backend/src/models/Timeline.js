const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  // Title of the event
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Description of the event
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Event date
  eventDate: {
    type: Date,
    required: true
  },
  // Event type/category
  category: {
    type: String,
    enum: [
      'first_message',
      'first_call',
      'first_video_call',
      'first_meeting',
      'anniversary',
      'birthday',
      'special_moment',
      'milestone',
      'trip',
      'gift',
      'confession',
      'proposal',
      'other'
    ],
    default: 'special_moment'
  },
  // Related photos
  photos: [{
    url: String,
    publicId: String,
    thumbnailUrl: String
  }],
  // Location
  location: {
    type: String,
    trim: true
  },
  // Coordinates for map display
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  // Created by (which user added this event)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Is this a recurring event (like anniversaries)
  isRecurring: {
    type: Boolean,
    default: false
  },
  // Recurring type
  recurringType: {
    type: String,
    enum: ['yearly', 'monthly', 'weekly'],
    default: 'yearly'
  },
  // Order/priority for display
  order: {
    type: Number,
    default: 0
  },
  // Is this event featured/highlighted
  isFeatured: {
    type: Boolean,
    default: false
  },
  // isActive flag
  isActive: {
    type: Boolean,
    default: true
  },
  // Mood/emoji for the event
  mood: {
    type: String,
    default: '❤️'
  }
}, {
  timestamps: true
});

// Index for efficient querying
timelineSchema.index({ eventDate: -1 });
timelineSchema.index({ category: 1, isFeatured: 1 });

// Virtual for formatted date
timelineSchema.virtual('formattedDate').get(function() {
  return new Date(this.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time ago
timelineSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const eventDate = new Date(this.eventDate);
  const diffMs = now - eventDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Virtual for years/months/days together at this event
timelineSchema.virtual('relationshipDuration').get(function() {
  // This would need the relationship start date from User
  // Can be calculated on the frontend
  return null;
});

const Timeline = mongoose.model('Timeline', timelineSchema);

module.exports = Timeline;