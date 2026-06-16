const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  profilePhotoPublicId: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Relationship details
  relationshipStartDate: {
    type: Date,
    default: null
  },
  // Location for distance calculation
  location: {
    country: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0
      },
      lng: {
        type: Number,
        default: 0
      }
    }
  },
  // Partner reference (for two-user system)
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Preferences
  favoriteColor: {
    type: String,
    default: '#ec4899'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'dark'
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password was modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for days together
userSchema.virtual('daysTogether').get(function() {
  if (this.relationshipStartDate) {
    const diff = Date.now() - new Date(this.relationshipStartDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Update lastSeen before saving
userSchema.pre('save', function(next) {
  this.lastSeen = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;