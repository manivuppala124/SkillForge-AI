const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, param } = require('express-validator')
const { 
  generatePortfolio, 
  getPortfolio, 
  updatePortfolio,
  publishPortfolio,
  getPublicPortfolio,
  uploadPortfolioImage,
  getPortfolioAnalytics,
  deletePortfolio
} = require('../controllers/portfolioController')
const { auth, optionalAuth, createUserRateLimit } = require('../middleware/auth')
const { uploadImage, handleUploadError, requireFile } = require('../middleware/upload')

// Rate limiting for portfolio routes
const portfolioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 portfolio operations per hour per IP
  message: {
    success: false,
    message: 'Too many portfolio requests, please try again later'
  }
})

// Validation middleware
const portfolioValidation = [
  body('personalInfo.name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('personalInfo.title')
    .optional()
    .isLength({ max: 150 })
    .withMessage('Title must not exceed 150 characters')
    .trim()
    .escape(),
  body('personalInfo.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
    .trim()
    .escape(),
  body('personalInfo.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('personalInfo.phone')
    .optional()
    .matches(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Invalid phone number format'),
  body('personalInfo.website')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Invalid website URL'),
  body('template')
    .optional()
    .isIn(['modern', 'classic', 'minimal', 'creative', 'professional'])
    .withMessage('Invalid template type'),
  body('socialLinks')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Social links must be an array with maximum 10 items'),
  body('socialLinks.*.platform')
    .optional()
    .isIn(['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'dribbble', 'behance', 'medium', 'dev.to', 'stackoverflow', 'other'])
    .withMessage('Invalid social platform'),
  body('socialLinks.*.url')
    .optional()
    .isURL({ require_protocol: true })
    .withMessage('Invalid social media URL')
]

const publishValidation = [
  body('customSlug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Custom slug can only contain lowercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 50 })
    .withMessage('Custom slug must be between 3 and 50 characters')
]

const userIdValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
]

const portfolioIdValidation = [
  param('portfolioId')
    .isMongoId()
    .withMessage('Invalid portfolio ID')
]

const slugValidation = [
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format')
    .isLength({ min: 3, max: 50 })
    .withMessage('Slug must be between 3 and 50 characters')
]

// @route   POST /api/portfolio/generate
// @desc    Generate/Create portfolio
// @access  Private
router.post('/generate', 
  auth,
  portfolioLimiter,
  createUserRateLimit(10, 60 * 60 * 1000), // 10 portfolio creations per hour per user
  portfolioValidation,
  handleUploadError,
  generatePortfolio
)

// @route   GET /api/portfolio/:userId
// @desc    Get user's portfolio
// @access  Private
router.get('/:userId', 
  auth,
  createUserRateLimit(100, 15 * 60 * 1000),
  userIdValidation,
  handleUploadError,
  getPortfolio
)

// @route   PUT /api/portfolio/:portfolioId
// @desc    Update portfolio
// @access  Private
router.put('/:portfolioId', 
  auth,
  createUserRateLimit(50, 60 * 60 * 1000), // 50 updates per hour per user
  portfolioIdValidation,
  portfolioValidation,
  handleUploadError,
  updatePortfolio
)

// @route   POST /api/portfolio/:portfolioId/publish
// @desc    Publish/unpublish portfolio
// @access  Private
router.post('/:portfolioId/publish', 
  auth,
  createUserRateLimit(10, 60 * 60 * 1000),
  portfolioIdValidation,
  publishValidation,
  handleUploadError,
  publishPortfolio
)

// @route   POST /api/portfolio/:portfolioId/upload-image
// @desc    Upload portfolio image
// @access  Private
router.post('/:portfolioId/upload-image',
  auth,
  createUserRateLimit(20, 60 * 60 * 1000),
  portfolioIdValidation,
  uploadImage,
  requireFile('image'),
  handleUploadError,
  uploadPortfolioImage
)

// @route   GET /api/portfolio/:portfolioId/analytics
// @desc    Get portfolio analytics
// @access  Private
router.get('/:portfolioId/analytics',
  auth,
  createUserRateLimit(50, 60 * 60 * 1000),
  portfolioIdValidation,
  handleUploadError,
  getPortfolioAnalytics
)

// @route   DELETE /api/portfolio/:portfolioId
// @desc    Delete portfolio
// @access  Private
router.delete('/:portfolioId',
  auth,
  createUserRateLimit(5, 60 * 60 * 1000),
  portfolioIdValidation,
  handleUploadError,
  deletePortfolio
)

// @route   GET /api/portfolio/public/:slug
// @desc    Get public portfolio by slug
// @access  Public
router.get('/public/:slug', 
  optionalAuth,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Higher limit for public access
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    }
  }),
  slugValidation,
  handleUploadError,
  getPublicPortfolio
)

// Health check for portfolio service
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'portfolio',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
