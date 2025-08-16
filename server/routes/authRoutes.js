// const express = require('express')
// const router = express.Router()
// const rateLimit = require('express-rate-limit')
// const { body } = require('express-validator')
// const { 
//   register, 
//   login, 
//   getProfile, 
//   updateProfile,
//   deleteAccount,
//   getUserStats
// } = require('../controllers/authController')
// const { auth, createUserRateLimit } = require('../middleware/auth')
// const { handleUploadError } = require('../middleware/upload')

// // Rate limiting for auth routes
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many authentication attempts, please try again later',
//     retryAfter: '15 minutes'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// })

// // Validation middleware
// const registerValidation = [
//   body('idToken')
//     .notEmpty()
//     .withMessage('ID token is required')
//     .isLength({ min: 10 })
//     .withMessage('Invalid ID token format')
// ]

// const profileUpdateValidation = [
//   body('profile.domain')
//     .optional()
//     .isIn(['Web Development', 'Data Science', 'AI/ML', 'Cybersecurity', 'Mobile Development', 'DevOps', 'Other'])
//     .withMessage('Invalid domain'),
//   body('profile.skillLevel')
//     .optional()
//     .isIn(['Beginner', 'Intermediate', 'Advanced'])
//     .withMessage('Invalid skill level'),
//   body('profile.currentSkills')
//     .optional()
//     .isArray({ max: 50 })
//     .withMessage('Skills must be an array with maximum 50 items'),
//   body('profile.bio')
//     .optional()
//     .isLength({ max: 500 })
//     .withMessage('Bio must not exceed 500 characters')
//     .trim()
//     .escape(),
//   body('settings.emailNotifications')
//     .optional()
//     .isBoolean()
//     .withMessage('Email notifications must be boolean'),
//   body('settings.language')
//     .optional()
//     .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
//     .withMessage('Invalid language code')
// ]

// // @route   POST /api/auth/register
// // @desc    Register user
// // @access  Public
// router.post('/register', 
//   authLimiter,
//   registerValidation,
//   handleUploadError,
//   register
// )

// // @route   POST /api/auth/login  
// // @desc    Login user
// // @access  Public
// router.post('/login', 
//   authLimiter,
//   registerValidation,
//   handleUploadError,
//   login
// )

// // @route   GET /api/auth/profile
// // @desc    Get user profile
// // @access  Private
// router.get('/profile', 
//   auth,
//   createUserRateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes per user
//   getProfile
// )

// // @route   PUT /api/auth/profile
// // @desc    Update user profile
// // @access  Private
// router.put('/profile', 
//   auth,
//   createUserRateLimit(20, 15 * 60 * 1000), // 20 updates per 15 minutes per user
//   profileUpdateValidation,
//   handleUploadError,
//   updateProfile
// )

// // @route   DELETE /api/auth/account
// // @desc    Delete user account
// // @access  Private
// router.delete('/account',
//   auth,
//   authLimiter,
//   body('confirmPassword')
//     .equals('DELETE')
//     .withMessage('Please confirm account deletion by typing "DELETE"'),
//   handleUploadError,
//   deleteAccount
// )

// // @route   GET /api/auth/stats
// // @desc    Get user statistics
// // @access  Private
// router.get('/stats',
//   auth,
//   createUserRateLimit(50, 15 * 60 * 1000),
//   getUserStats
// )

// // Health check for auth service
// router.get('/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     service: 'auth',
//     status: 'healthy',
//     timestamp: new Date().toISOString()
//   })
// })

// module.exports = router
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  deleteAccount,
  getUserStats
} = require('../controllers/authController');
const { auth, createUserRateLimit } = require('../middleware/auth'); // ✅ Fixed import
const { handleUploadError } = require('../middleware/upload');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const registerValidation = [
  body('idToken')
    .notEmpty()
    .withMessage('ID token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid ID token format')
];

const profileUpdateValidation = [
  body('profile.domain')
    .optional()
    .isIn(['Web Development', 'Data Science', 'AI/ML', 'Cybersecurity', 'Mobile Development', 'DevOps', 'Other'])
    .withMessage('Invalid domain'),
  body('profile.skillLevel')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid skill level'),
  body('profile.currentSkills')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Skills must be an array with maximum 50 items'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
    .trim()
    .escape(),
  body('settings.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be boolean'),
  body('settings.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
    .withMessage('Invalid language code')
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', 
  authLimiter,
  registerValidation,
  handleUploadError,
  register
);

// @route   POST /api/auth/login  
// @desc    Login user
// @access  Public
router.post('/login', 
  authLimiter,
  registerValidation,
  handleUploadError,
  login
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', 
  auth,
  createUserRateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes per user
  getProfile
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  auth,
  createUserRateLimit(20, 15 * 60 * 1000), // 20 updates per 15 minutes per user
  profileUpdateValidation,
  handleUploadError,
  updateProfile
);

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account',
  auth,
  authLimiter,
  body('confirmPassword')
    .equals('DELETE')
    .withMessage('Please confirm account deletion by typing "DELETE"'),
  handleUploadError,
  deleteAccount
);

// @route   GET /api/auth/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats',
  auth,
  createUserRateLimit(50, 15 * 60 * 1000),
  getUserStats
);

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'auth',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
