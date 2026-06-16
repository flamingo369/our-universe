const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
  // Author of the letter
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Recipient of the letter
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Letter title/subject
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Letter content (supports HTML for formatting)
  content: {
    type: String,
    required: true
  },
  // Letter style/theme
  theme: {
    type: String,
    enum: ['romantic', 'casual', 'poetic', 'birthday', 'anniversary', 'miss-you', 'love', 'custom'],
    default: 'romantic'
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'delivered', 'read'],
    default: 'draft'
  },
  // Favorite status
  isFavorite: {
    type: Boolean,
    default: false
  },
  // Favorite marked by recipient
  favoriteByRecipient: {
    type: Boolean,
    default: false
  },
  // Envelope style
  envelopeStyle: {
    type: String,
    enum: ['classic', 'modern', 'vintage', 'cute', 'elegant'],
    default: 'classic'
  },
  // Mood/emoji
  mood: {
    type: String,
    default: '❤️'
  },
  // Attachments (photos, etc.)
  attachments: [{
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['image']
    }
  }],
  // Read receipt
  readAt: {
    type: Date
  },
  // Delivery date
  deliveredAt: {
    type: Date
  },
  // Tags for organization
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient querying
letterSchema.index({ author: 1, createdAt: -1 });
letterSchema.index({ recipient: 1, status: 1, createdAt: -1 });

// Virtual for excerpt (first 100 characters)
letterSchema.virtual('excerpt').get(function() {
  const plainText = this.content.replace(/<[^>]*>/g, '').trim();
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
});

// Virtual for word count
letterSchema.virtual('wordCount').get(function() {
  const plainText = this.content.replace(/<[^>]*>/g, '').trim();
  return plainText.split(/\s+/).length;
});

// Method to mark as read
letterSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
letterSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

const Letter = mongoose.model('Letter', letterSchema);

module.exports = Letter;