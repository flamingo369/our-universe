const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Cloudinary URLs
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  publicId: {
    type: String,
    required: true
  },
  // Image dimensions
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  // Category/Tag
  category: {
    type: String,
    enum: ['memories', 'moments', 'special', 'random', 'selfie', 'nature', 'travel'],
    default: 'memories'
  },
  // Tags for organization
  tags: [{
    type: String,
    trim: true
  }],
  // Likes
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Date the photo was taken
  dateTaken: {
    type: Date
  },
  // Location where photo was taken
  location: {
    type: String,
    trim: true
  },
  // Featured flag
  isFeatured: {
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
photoSchema.index({ uploadedBy: 1, createdAt: -1 });
photoSchema.index({ category: 1, isFeatured: 1 });

// Virtual for like count
photoSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
photoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user liked
photoSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add like
photoSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId });
  }
  return this.save();
};

// Method to remove like
photoSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;