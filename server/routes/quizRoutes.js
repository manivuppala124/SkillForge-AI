const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, param, query } = require('express-validator')
const { 
  generateQuiz, 
  getQuiz,
  submitQuiz, 
  getQuizHistory, 
  getQuizStats,
  deleteQuiz
} = require('../controllers/quizController')
const { auth, createUserRateLimit } = require('../middleware/auth')
const { handleUploadError } = require('../middleware/upload')

// Rate limiting for quiz routes
const quizGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // 15 quiz generations per hour per IP
  message: {
    success: false,
    message: 'Too many quiz generation requests, please try again later'
  }
})

const quizSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 submissions per minute per IP
  message: {
    success: false,
    message: 'Too many quiz submissions, please slow down'
  }
})

// Validation middleware
const generateQuizValidation = [
  body('topic')
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Topic must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('numQuestions')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Number of questions must be between 5 and 50'),
  body('category')
    .optional()
    .isIn(['technical', 'general', 'certification', 'interview'])
    .withMessage('Invalid category'),
  body('timeLimit')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('Time limit must be between 5 and 180 minutes')
]

const submitQuizValidation = [
  body('quizId')
    .isMongoId()
    .withMessage('Invalid quiz ID'),
  body('answers')
    .isObject()
    .withMessage('Answers must be an object'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 86400 }) // Max 24 hours in seconds
    .withMessage('Time spent must be between 0 and 86400 seconds')
]

const quizIdValidation = [
  param('quizId')
    .isMongoId()
    .withMessage('Invalid quiz ID')
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
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty filter'),
  query('topic')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Topic filter must be between 1 and 100 characters')
    .trim()
    .escape()
]

// @route   POST /api/quiz/generate
// @desc    Generate new quiz
// @access  Private
router.post('/generate', 
  auth,
  quizGenerationLimiter,
  createUserRateLimit(10, 60 * 60 * 1000), // 10 generations per hour per user
  generateQuizValidation,
  handleUploadError,
  generateQuiz
)

// @route   GET /api/quiz/:quizId
// @desc    Get specific quiz
// @access  Private
router.get('/:quizId', 
  auth,
  createUserRateLimit(100, 15 * 60 * 1000),
  quizIdValidation,
  handleUploadError,
  getQuiz
)

// @route   POST /api/quiz/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/submit', 
  auth,
  quizSubmissionLimiter,
  createUserRateLimit(50, 60 * 60 * 1000), // 50 submissions per hour per user
  submitQuizValidation,
  handleUploadError,
  submitQuiz
)

// @route   GET /api/quiz/history/:userId
// @desc    Get user's quiz history
// @access  Private
router.get('/history/:userId', 
  auth,
  createUserRateLimit(50, 15 * 60 * 1000),
  userIdValidation,
  paginationValidation,
  handleUploadError,
  getQuizHistory
)

// @route   GET /api/quiz/stats/:userId
// @desc    Get quiz statistics
// @access  Private
router.get('/stats/:userId',
  auth,
  createUserRateLimit(20, 15 * 60 * 1000),
  userIdValidation,
  handleUploadError,
  getQuizStats
)

// @route   DELETE /api/quiz/:quizId
// @desc    Delete quiz (soft delete)
// @access  Private
router.delete('/:quizId',
  auth,
  createUserRateLimit(10, 60 * 60 * 1000),
  quizIdValidation,
  handleUploadError,
  deleteQuiz
)

// Health check for quiz service
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'quiz',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
