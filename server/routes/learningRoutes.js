const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, param, query } = require('express-validator')
const { 
  generateLearningPath, 
  getLearningPath, 
  getAllPaths,
  updateProgress,
  deletePath,
  getPathById
} = require('../controllers/learningController')
const { auth, createUserRateLimit } = require('../middleware/auth')
const { handleUploadError } = require('../middleware/upload')

// Rate limiting for learning routes
const learningLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit path generation to 10 per hour per IP
  message: {
    success: false,
    message: 'Too many learning path requests, please try again later',
    retryAfter: '1 hour'
  }
})

// Validation middleware
const generatePathValidation = [
  body('goal')
    .notEmpty()
    .withMessage('Goal is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Goal must be between 5 and 200 characters')
    .trim()
    .escape(),
  body('timeline')
    .isInt({ min: 7, max: 365 })
    .withMessage('Timeline must be between 7 and 365 days'),
  body('currentSkills')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Current skills must be an array with maximum 20 items'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('hoursPerWeek')
    .optional()
    .isInt({ min: 1, max: 40 })
    .withMessage('Hours per week must be between 1 and 40')
]

const progressUpdateValidation = [
  body('pathId')
    .isMongoId()
    .withMessage('Invalid path ID'),
  body('moduleId')
    .notEmpty()
    .withMessage('Module ID is required'),
  body('action')
    .isIn(['complete_module', 'uncomplete_module', 'complete_resource', 'add_time', 'add_note'])
    .withMessage('Invalid action'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 1440 }) // Max 24 hours in minutes
    .withMessage('Time spent must be between 0 and 1440 minutes'),
  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Note must not exceed 1000 characters')
    .trim()
    .escape()
]

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
]

const pathIdValidation = [
  param('pathId')
    .isMongoId()
    .withMessage('Invalid path ID')
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
  query('status')
    .optional()
    .isIn(['all', 'active', 'inactive'])
    .withMessage('Invalid status filter')
]

// @route   POST /api/learning/generate-path
// @desc    Generate new learning path
// @access  Private
router.post('/generate-path', 
  auth,
  learningLimiter,
  createUserRateLimit(5, 60 * 60 * 1000), // 5 generations per hour per user
  generatePathValidation,
  handleUploadError,
  generateLearningPath
)

// @route   GET /api/learning/path/:userId
// @desc    Get active learning path
// @access  Private
router.get('/path/:userId', 
  auth,
  createUserRateLimit(100, 15 * 60 * 1000),
  userIdValidation,
  handleUploadError,
  getLearningPath
)

// @route   GET /api/learning/paths/:userId
// @desc    Get all learning paths for user
// @access  Private
router.get('/paths/:userId', 
  auth,
  createUserRateLimit(50, 15 * 60 * 1000),
  userIdValidation,
  paginationValidation,
  handleUploadError,
  getAllPaths
)

// @route   GET /api/learning/path/details/:pathId
// @desc    Get learning path by ID
// @access  Private
router.get('/path/details/:pathId',
  auth,
  createUserRateLimit(100, 15 * 60 * 1000),
  pathIdValidation,
  handleUploadError,
  getPathById
)

// @route   POST /api/learning/progress
// @desc    Update module progress
// @access  Private
router.post('/progress', 
  auth,
  createUserRateLimit(200, 15 * 60 * 1000), // Allow frequent progress updates
  progressUpdateValidation,
  handleUploadError,
  updateProgress
)

// @route   DELETE /api/learning/path/:pathId
// @desc    Delete learning path
// @access  Private
router.delete('/path/:pathId', 
  auth,
  createUserRateLimit(10, 60 * 60 * 1000), // 10 deletions per hour per user
  pathIdValidation,
  handleUploadError,
  deletePath
)

// Health check for learning service
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'learning',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
