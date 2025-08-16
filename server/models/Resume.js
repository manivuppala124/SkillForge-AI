// server/models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  storedFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  parsedSections: {
    contact: String,
    summary: String,
    experience: String,
    education: String,
    skills: String,
    projects: String,
    certifications: String
  },
  analysis: {
    skills: {
      technical: [String],
      soft: [String],
      tools: [String]
    },
    experience: {
      totalYears: Number,
      industries: [String],
      roles: [String]
    },
    education: {
      degrees: [String],
      institutions: [String]
    },
    strengths: [String],
    improvements: [String],
    score: {
      overall: Number,
      sections: {
        content: Number,
        format: Number,
        keywords: Number
      }
    },
    recommendations: [String]
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'resumes'
});

// Indexes for performance
ResumeSchema.index({ userId: 1, uploadedAt: -1 });
ResumeSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
