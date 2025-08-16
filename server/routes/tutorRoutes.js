const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, param, query } = require('express-validator')
const { 
  askTutorQuestion, 
  getTutorHistory,
  explainTopic,
  generateStudyMaterial,
  getStudySuggestions
} = require('../controllers/tutorController')
const { auth, createUserRateLimit } = require('../middleware/auth')
const { handleUploadError } = require('../middleware/upload')

// Rate limiting for tutor routes
const tutorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 tutor questions per hour per IP
  message: {
    success: false,
    message: 'Too many tutor requests, please try again later'
  }
})

const studyMaterialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 study material generations per hour per IP
  message: {
    success: false,
    message: 'Too many study material requests, please try again later'
  }
})

// Validation middleware
const askQuestionValidation = [
  body('question')
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Question must be between 5 and 1000 characters')
    .trim()
    .escape(),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  body('subject')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters')
    .trim()
    .escape()
]

const explainTopicValidation = [
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Topic must be between 2 and 200 characters')
    .trim()
    .escape(),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level'),
  body('detail')
    .optional()
    .isIn(['brief', 'medium', 'detailed'])
    .withMessage('Invalid detail level')
]

const generateMaterialValidation = [
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Topic must be between 2 and 200 characters')
    .trim()
    .escape(),
  body('materialType')
    .optional()
    .isIn(['notes', 'flashcards', 'summary', 'outline', 'practice-questions'])
    .withMessage('Invalid material type'),
  body('duration')
    .optional()
    .isInt({ min: 5, max: 240 })
    .withMessage('Duration must be between 5 and 240 minutes')
]

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
]

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('subject')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject filter must be between 1 and 100 characters')
    .trim()
    .escape()
]

// @route   POST /api/tutor/ask
// @desc    Ask AI tutor a question
// @access  Private
router.post('/ask', 
  auth,
  tutorLimiter,
  createUserRateLimit(60, 60 * 60 * 1000), // 60 questions per hour per user
  askQuestionValidation,
  handleUploadError,
  askTutorQuestion
)

// @route   POST /api/tutor/explain
// @desc    Explain a topic
// @access  Private
router.post('/explain',
  auth,
  tutorLimiter,
  createUserRateLimit(30, 60 * 60 * 1000), // 30 explanations per hour per user
  explainTopicValidation,
  handleUploadError,
  explainTopic
)

// @route   POST /api/tutor/generate-study-material
// @desc    Generate study material
// @access  Private
router.post('/generate-study-material',
  auth,
  studyMaterialLimiter,
  createUserRateLimit(15, 60 * 60 * 1000), // 15 generations per hour per user
  generateMaterialValidation,
  handleUploadError,
  generateStudyMaterial
)

// @route   GET /api/tutor/history/:userId
// @desc    Get tutor conversation history
// @access  Private
router.get('/history/:userId', 
  auth,
  createUserRateLimit(50, 15 * 60 * 1000),
  userIdValidation,
  paginationValidation,
  handleUploadError,
  getTutorHistory
)

// @route   GET /api/tutor/suggestions/:userId
// @desc    Get personalized study suggestions
// @access  Private
router.get('/suggestions/:userId',
  auth,
  createUserRateLimit(20, 60 * 60 * 1000),
  userIdValidation,
  handleUploadError,
  getStudySuggestions
)

// Health check for tutor service
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'tutor',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
