const mongoose = require('mongoose')

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  goal: {
    type: String,
    required: true,
    trim: true
  },
  timeline: {
    totalDays: {
      type: Number,
      required: true,
      min: 1
    },
    hoursPerWeek: {
      type: Number,
      default: 10,
      min: 1
    },
    startDate: Date,
    expectedEndDate: Date
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  currentSkills: [String],
  targetSkills: [String],
  modules: [{
    moduleId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    week: {
      type: Number,
      required: true,
      min: 1
    },
    order: {
      type: Number,
      required: true
    },
    estimatedHours: {
      type: Number,
      default: 5,
      min: 1
    },
    skills: [String],
    prerequisites: [String],
    learningObjectives: [String],
    resources: [{
      resourceId: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
      },
      title: {
        type: String,
        required: true
      },
      description: String,
      url: String,
      type: {
        type: String,
        enum: ['video', 'article', 'book', 'course', 'practice', 'quiz', 'project'],
        required: true
      },
      duration: Number, // in minutes
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      },
      provider: String,
      isPaid: {
        type: Boolean,
        default: false
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      tags: [String]
    }],
    assessments: [{
      type: {
        type: String,
        enum: ['quiz', 'assignment', 'project', 'peer-review'],
        default: 'quiz'
      },
      title: String,
      description: String,
      passingCriteria: String
    }],
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    progress: {
      resourcesCompleted: {
        type: Number,
        default: 0
      },
      totalResources: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    notes: String,
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  }],
  progress: {
    currentModule: {
      type: Number,
      default: 0
    },
    modulesCompleted: {
      type: Number,
      default: 0
    },
    totalModules: {
      type: Number,
      default: 0
    },
    overallPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    hoursSpent: {
      type: Number,
      default: 0
    },
    estimatedHoursRemaining: Number
  },
  analytics: {
    averageTimePerModule: Number,
    completionRate: Number,
    strugglingAreas: [String],
    strengths: [String],
    recommendedPace: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  category: {
    type: String,
    enum: ['programming', 'design', 'data-science', 'business', 'marketing', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
})

// Indexes
// learningPathSchema.index({ userId: 1, isActive: 1 })
// learningPathSchema.index({ category: 1, isPublic: 1 })
// learningPathSchema.index({ difficulty: 1 })
// learningPathSchema.index({ 'progress.overallPercentage': -1 })

// Pre-save middleware to calculate progress and analytics
learningPathSchema.pre('save', function(next) {
  // Update timeline dates
  if (this.timeline.startDate && !this.timeline.expectedEndDate) {
    const startDate = new Date(this.timeline.startDate)
    this.timeline.expectedEndDate = new Date(startDate.getTime() + (this.timeline.totalDays * 24 * 60 * 60 * 1000))
  }

  // Calculate module progress
  this.modules.forEach(module => {
    module.progress.totalResources = module.resources.length
    module.progress.percentage = module.progress.totalResources > 0 
      ? Math.round((module.progress.resourcesCompleted / module.progress.totalResources) * 100)
      : 0
  })

  // Calculate overall progress
  const completedModules = this.modules.filter(module => module.completed).length
  this.progress.modulesCompleted = completedModules
  this.progress.totalModules = this.modules.length
  
  if (this.modules.length > 0) {
    this.progress.overallPercentage = Math.round((completedModules / this.modules.length) * 100)
    
    // Find current module (first incomplete module)
    const currentModuleIndex = this.modules.findIndex(module => !module.completed)
    this.progress.currentModule = currentModuleIndex !== -1 ? currentModuleIndex : this.modules.length - 1
  }

  // Calculate time analytics
  const totalTimeSpent = this.modules.reduce((sum, module) => sum + module.timeSpent, 0)
  this.progress.hoursSpent = Math.round(totalTimeSpent / 60 * 100) / 100 // Convert to hours with 2 decimal places
  
  if (completedModules > 0) {
    this.analytics.averageTimePerModule = Math.round((totalTimeSpent / completedModules) / 60 * 100) / 100
  }

  // Calculate estimated remaining hours
  if (this.progress.overallPercentage > 0 && this.progress.overallPercentage < 100) {
    const averageTimePerPercent = this.progress.hoursSpent / this.progress.overallPercentage
    this.progress.estimatedHoursRemaining = Math.round(averageTimePerPercent * (100 - this.progress.overallPercentage) * 100) / 100
  }

  next()
})

// Method to complete a module
learningPathSchema.methods.completeModule = function(moduleId) {
  const module = this.modules.id(moduleId)
  if (module && !module.completed) {
    module.completed = true
    module.completedAt = new Date()
    return true
  }
  return false
}

// Method to add time to a module
learningPathSchema.methods.addTimeToModule = function(moduleId, minutes) {
  const module = this.modules.id(moduleId)
  if (module) {
    module.timeSpent += minutes
    return true
  }
  return false
}

// Method to mark resource as completed
learningPathSchema.methods.completeResource = function(moduleId, resourceId) {
  const module = this.modules.id(moduleId)
  if (module) {
    const resource = module.resources.id(resourceId)
    if (resource) {
      module.progress.resourcesCompleted = Math.min(
        module.progress.resourcesCompleted + 1,
        module.resources.length
      )
      return true
    }
  }
  return false
}

module.exports = mongoose.model('LearningPath', learningPathSchema)
