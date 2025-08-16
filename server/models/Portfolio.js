const mongoose = require('mongoose')

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal', 'creative', 'professional'],
    default: 'modern'
  },
  personalInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxlength: 500
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    location: {
      city: String,
      country: String,
      timezone: String
    },
    website: {
      type: String,
      trim: true
    },
    profileImage: String,
    resume: String // URL to resume file
  },
  sections: {
    about: {
      enabled: {
        type: Boolean,
        default: true
      },
      content: String,
      order: {
        type: Number,
        default: 1
      }
    },
    skills: {
      enabled: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 2
      },
      categories: [{
        name: String,
        items: [{
          name: {
            type: String,
            required: true
          },
          level: {
            type: Number,
            min: 1,
            max: 10,
            default: 5
          },
          yearsOfExperience: Number,
          certified: {
            type: Boolean,
            default: false
          }
        }]
      }]
    },
    experience: {
      enabled: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 3
      },
      items: [{
        title: {
          type: String,
          required: true
        },
        company: {
          type: String,
          required: true
        },
        location: String,
        startDate: {
          type: Date,
          required: true
        },
        endDate: Date,
        current: {
          type: Boolean,
          default: false
        },
        description: String,
        achievements: [String],
        technologies: [String],
        links: [{
          name: String,
          url: String
        }]
      }]
    },
    education: {
      enabled: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 4
      },
      items: [{
        degree: {
          type: String,
          required: true
        },
        institution: {
          type: String,
          required: true
        },
        location: String,
        startDate: Date,
        endDate: Date,
        gpa: String,
        description: String,
        honors: [String],
        relevantCourses: [String]
      }]
    },
    projects: {
      enabled: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 5
      },
      items: [{
        title: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        technologies: [String],
        category: {
          type: String,
          enum: ['web', 'mobile', 'desktop', 'data-science', 'ai-ml', 'other'],
          default: 'web'
        },
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ['completed', 'in-progress', 'planned'],
          default: 'completed'
        },
        links: {
          live: String,
          github: String,
          demo: String,
          documentation: String
        },
        images: [String],
        featured: {
          type: Boolean,
          default: false
        },
        teamSize: Number,
        myRole: String,
        challenges: [String],
        learnings: [String]
      }]
    },
    certifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 6
      },
      items: [{
        name: {
          type: String,
          required: true
        },
        issuer: {
          type: String,
          required: true
        },
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        url: String,
        image: String,
        skills: [String]
      }]
    },
    testimonials: {
      enabled: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        default: 7
      },
      items: [{
        name: String,
        title: String,
        company: String,
        content: String,
        image: String,
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        date: Date
      }]
    }
  },
  socialLinks: [{
    platform: {
      type: String,
      enum: ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'dribbble', 'behance', 'medium', 'dev.to', 'stackoverflow', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    username: String,
    icon: String
  }],
  theme: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1E40AF'
    },
    accentColor: {
      type: String,
      default: '#F59E0B'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    textColor: {
      type: String,
      default: '#1F2937'
    },
    fontFamily: {
      type: String,
      enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'],
      default: 'Inter'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    layout: {
      type: String,
      enum: ['single-column', 'two-column', 'grid'],
      default: 'single-column'
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  },
  settings: {
    published: {
      type: Boolean,
      default: false
    },
    passwordProtected: {
      type: Boolean,
      default: false
    },
    password: String,
    allowComments: {
      type: Boolean,
      default: false
    },
    showContactForm: {
      type: Boolean,
      default: true
    },
    customDomain: String,
    googleAnalyticsId: String
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  analytics: {
    views: {
      total: {
        type: Number,
        default: 0
      },
      unique: {
        type: Number,
        default: 0
      },
      thisMonth: {
        type: Number,
        default: 0
      }
    },
    lastViewed: Date,
    topReferrers: [{
      source: String,
      visits: Number
    }],
    topPages: [{
      page: String,
      views: Number
    }]
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

// Indexes
// portfolioSchema.index({ userId: 1 })
// portfolioSchema.index({ slug: 1 })
// portfolioSchema.index({ 'settings.published': 1 })
// portfolioSchema.index({ createdAt: -1 })

// Pre-save middleware
portfolioSchema.pre('save', function(next) {
  // Generate slug if not exists
  if (!this.slug && this.personalInfo.name) {
    const baseSlug = this.personalInfo.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    this.slug = `${baseSlug}-${Date.now()}`
  }
  
  // Update SEO if not set
  if (!this.seo.title && this.personalInfo.name) {
    this.seo.title = `${this.personalInfo.name} - ${this.personalInfo.title || 'Portfolio'}`
  }
  
  if (!this.seo.description && this.personalInfo.bio) {
    this.seo.description = this.personalInfo.bio.substring(0, 160)
  }
  
  next()
})

// Method to increment views
portfolioSchema.methods.incrementViews = function(isUnique = false) {
  this.analytics.views.total += 1
  if (isUnique) {
    this.analytics.views.unique += 1
  }
  this.analytics.lastViewed = new Date()
  return this.save()
}

// Virtual for portfolio URL
portfolioSchema.virtual('portfolioUrl').get(function() {
  return `${process.env.FRONTEND_URL}/portfolio/${this.slug}`
})

module.exports = mongoose.model('Portfolio', portfolioSchema)
