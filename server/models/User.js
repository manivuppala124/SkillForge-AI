const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  profile: {
    domain: {
      type: String,
      enum: ['Web Development', 'Data Science', 'AI/ML', 'Cybersecurity', 'Mobile Development', 'DevOps', 'Other'],
      default: 'Other'
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    currentSkills: [String],
    goals: [String],
    bio: String,
    location: String,
    website: String
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  progress: {
    totalHoursStudied: {
      type: Number,
      default: 0,
      min: 0
    },
    skillsLearned: {
      type: Number,
      default: 0,
      min: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActivity: Date
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for user's full progress
userSchema.virtual('completionRate').get(function() {
  if (this.progress.skillsLearned === 0) return 0
  return Math.min((this.progress.skillsLearned / 10) * 100, 100)
})

// Update lastActivity before saving
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('progress.lastActivity')) {
    this.progress.lastActivity = new Date()
  }
  next()
})

module.exports = mongoose.model('User', userSchema)
