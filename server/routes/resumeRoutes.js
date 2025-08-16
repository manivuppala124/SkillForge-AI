// const express = require('express')
// const router = express.Router()
// const rateLimit = require('express-rate-limit')
// const { body, param, query } = require('express-validator')
// const { 
//   uploadResume, 
//   analyzeResume, 
//   getAnalysis,
//   getResumeList,
//   deleteResume,
//   getResumeAnalytics
// } = require('../controllers/resumeController')
// const { auth, createUserRateLimit } = require('../middleware/auth')
// const { uploadResume: uploadResumeMiddleware, handleUploadError, requireFile } = require('../middleware/upload')

// // Rate limiting for resume routes
// const resumeUploadLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 10, // 10 resume uploads per hour per IP
//   message: {
//     success: false,
//     message: 'Too many resume uploads, please try again later'
//   }
// })

// // Validation middleware
// const analyzeResumeValidation = [
//   body('resumeText')
//     .notEmpty()
//     .withMessage('Resume text is required')
//     .isLength({ min: 100, max: 50000 })
//     .withMessage('Resume text must be between 100 and 50,000 characters')
//     .trim(),
//   body('targetRole')
//     .optional()
//     .isLength({ min: 2, max: 100 })
//     .withMessage('Target role must be between 2 and 100 characters')
//     .trim()
//     .escape()
// ]

// const uploadResumeValidation = [
//   body('targetRole')
//     .optional()
//     .isLength({ min: 2, max: 100 })
//     .withMessage('Target role must be between 2 and 100 characters')
//     .trim()
//     .escape()
// ]

// const userIdValidation = [
//   param('userId')
//     .isMongoId()
//     .withMessage('Invalid user ID')
// ]

// const resumeIdValidation = [
//   param('resumeId')
//     .isMongoId()
//     .withMessage('Invalid resume ID')
// ]

// const paginationValidation = [
//   query('page')
//     .optional()
//     .isInt({ min: 1, max: 1000 })
//     .withMessage('Page must be between 1 and 1000'),
//   query('limit')
//     .optional()
//     .isInt({ min: 1, max: 50 })
//     .withMessage('Limit must be between 1 and 50'),
//   query('latest')
//     .optional()
//     .isBoolean()
//     .withMessage('Latest must be boolean'),
//   query('resumeId')
//     .optional()
//     .isMongoId()
//     .withMessage('Invalid resume ID in query')
// ]

// // @route   POST /api/resume/upload
// // @desc    Upload and analyze resume
// // @access  Private
// router.post('/upload', 
//   auth,
//   resumeUploadLimiter,
//   createUserRateLimit(5, 60 * 60 * 1000), // 5 uploads per hour per user
//   uploadResumeMiddleware,
//   requireFile('resume'),
//   uploadResumeValidation,
//   handleUploadError,
//   uploadResume
// )

// // @route   POST /api/resume/analyze
// // @desc    Analyze resume text directly
// // @access  Private
// router.post('/analyze', 
//   auth,
//   resumeUploadLimiter,
//   createUserRateLimit(10, 60 * 60 * 1000), // 10 analyses per hour per user
//   analyzeResumeValidation,
//   handleUploadError,
//   analyzeResume
// )

// // @route   GET /api/resume/analysis/:userId
// // @desc    Get resume analysis
// // @access  Private
// router.get('/analysis/:userId', 
//   auth,
//   createUserRateLimit(100, 15 * 60 * 1000),
//   userIdValidation,
//   paginationValidation,
//   handleUploadError,
//   getAnalysis
// )

// // @route   GET /api/resume/list/:userId
// // @desc    Get all resumes for user
// // @access  Private
// router.get('/list/:userId',
//   auth,
//   createUserRateLimit(50, 15 * 60 * 1000),
//   userIdValidation,
//   paginationValidation,
//   handleUploadError,
//   getResumeList
// )

// // @route   GET /api/resume/analytics/:userId
// // @desc    Get resume analytics
// // @access  Private
// router.get('/analytics/:userId',
//   auth,
//   createUserRateLimit(20, 15 * 60 * 1000),
//   userIdValidation,
//   handleUploadError,
//   getResumeAnalytics
// )

// // @route   DELETE /api/resume/:resumeId
// // @desc    Delete resume
// // @access  Private
// router.delete('/:resumeId',
//   auth,
//   createUserRateLimit(10, 60 * 60 * 1000),
//   resumeIdValidation,
//   handleUploadError,
//   deleteResume
// )

// // Health check for resume service
// router.get('/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     service: 'resume',
//     status: 'healthy',
//     timestamp: new Date().toISOString()
//   })
// })

// module.exports = router
// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload, uploadResume } = require('../services/fileService');
const { uploadAndAnalyzeResume } = require('../controllers/resumeController');

// Upload and analyze resume
router.post('/upload', 
  auth, 
  upload,        // Multer middleware
  uploadResume,  // File processing
  uploadAndAnalyzeResume  // Analysis controller
);

module.exports = router;
