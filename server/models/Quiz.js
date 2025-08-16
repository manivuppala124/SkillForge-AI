const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
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
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['technical', 'general', 'certification', 'interview'],
    default: 'technical'
  },
  questions: [{
    questionId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'fill-blank'],
      default: 'multiple-choice'
    },
    options: [String],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be number (index) or string
      required: true
    },
    explanation: String,
    points: {
      type: Number,
      default: 1,
      min: 1
    },
    tags: [String]
  }],
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 30,
      min: 1
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    allowRetakes: {
      type: Boolean,
      default: true
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1
    }
  },
  attempts: [{
    attemptId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    userAnswers: [{
      questionId: String,
      selectedAnswer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeSpent: Number // in seconds
    }],
    score: {
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      points: Number,
      totalPoints: Number,
      correctAnswers: Number,
      totalQuestions: Number
    },
    timeSpent: Number, // total time in seconds
    passed: Boolean,
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date
  }],
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: Number,
    averageTimeSpent: Number,
    difficultyRating: Number, // based on user performance
    popularityScore: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes
// quizSchema.index({ userId: 1, createdAt: -1 })
// quizSchema.index({ topic: 1, difficulty: 1 })
// quizSchema.index({ isPublic: 1, isActive: 1 })
// quizSchema.index({ 'analytics.popularityScore': -1 })

// Calculate analytics before saving
quizSchema.pre('save', function(next) {
  if (this.attempts && this.attempts.length > 0) {
    const completedAttempts = this.attempts.filter(attempt => attempt.completedAt)
    
    this.analytics.totalAttempts = completedAttempts.length
    
    if (completedAttempts.length > 0) {
      // Calculate average score
      const totalScore = completedAttempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0)
      this.analytics.averageScore = totalScore / completedAttempts.length
      
      // Calculate average time spent
      const totalTime = completedAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0)
      this.analytics.averageTimeSpent = totalTime / completedAttempts.length
    }
  }
  next()
})

// Method to add a new attempt
quizSchema.methods.addAttempt = function(userAnswers, timeSpent) {
  const attempt = {
    userAnswers: [],
    timeSpent,
    startedAt: new Date(Date.now() - (timeSpent * 1000)),
    completedAt: new Date()
  }

  let correctAnswers = 0
  let totalPoints = 0
  
  this.questions.forEach((question, index) => {
    const userAnswer = userAnswers[question.questionId] || userAnswers[index]
    const isCorrect = this.checkAnswer(question, userAnswer)
    
    attempt.userAnswers.push({
      questionId: question.questionId,
      selectedAnswer: userAnswer,
      isCorrect,
      timeSpent: Math.floor(timeSpent / this.questions.length) // Distribute time evenly
    })
    
    if (isCorrect) {
      correctAnswers++
      totalPoints += question.points
    }
  })

  const totalPossiblePoints = this.questions.reduce((sum, q) => sum + q.points, 0)
  const percentage = Math.round((totalPoints / totalPossiblePoints) * 100)

  attempt.score = {
    percentage,
    points: totalPoints,
    totalPoints: totalPossiblePoints,
    correctAnswers,
    totalQuestions: this.questions.length
  }

  attempt.passed = percentage >= this.settings.passingScore

  this.attempts.push(attempt)
  return attempt
}

// Method to check if answer is correct
quizSchema.methods.checkAnswer = function(question, userAnswer) {
  if (question.type === 'multiple-choice') {
    return question.correctAnswer === userAnswer
  } else if (question.type === 'true-false') {
    return question.correctAnswer === userAnswer
  } else if (question.type === 'fill-blank') {
    return question.correctAnswer.toLowerCase().trim() === String(userAnswer).toLowerCase().trim()
  }
  return false
}

module.exports = mongoose.model('Quiz', quizSchema)
