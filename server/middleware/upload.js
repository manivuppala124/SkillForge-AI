const multer = require('multer')
const path = require('path')

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter function
const createFileFilter = (allowedMimeTypes, allowedExtensions) => {
  return (req, file, cb) => {
    // Check MIME type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false)
    }

    // Check file extension
    if (allowedExtensions) {
      const ext = path.extname(file.originalname).toLowerCase()
      if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`), false)
      }
    }

    cb(null, true)
  }
}

// Generic upload middleware factory
const createUploadMiddleware = (options = {}) => {
  const {
    fileSize = 5 * 1024 * 1024, // 5MB default
    allowedMimeTypes = null,
    allowedExtensions = null,
    fieldName = 'file'
  } = options

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: fileSize,
      files: 1, // Limit to 1 file per request
      fields: 10 // Limit number of non-file fields
    },
    fileFilter: createFileFilter(allowedMimeTypes, allowedExtensions)
  })

  return upload.single(fieldName)
}

// Pre-configured upload middlewares
const uploadDocument = createUploadMiddleware({
  fileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx'],
  fieldName: 'document'
})

const uploadResume = createUploadMiddleware({
  fileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['application/pdf'],
  allowedExtensions: ['.pdf'],
  fieldName: 'resume'
})

const uploadImage = createUploadMiddleware({
  fileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  fieldName: 'image'
})

const uploadVideo = createUploadMiddleware({
  fileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm'
  ],
  allowedExtensions: ['.mp4', '.mpeg', '.mov', '.webm'],
  fieldName: 'video'
})

const uploadAudio = createUploadMiddleware({
  fileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3'
  ],
  allowedExtensions: ['.mp3', '.wav', '.ogg'],
  fieldName: 'audio'
})

// Multiple files upload
const uploadMultiple = (fieldName = 'files', maxCount = 5, options = {}) => {
  const {
    fileSize = 5 * 1024 * 1024,
    allowedMimeTypes = null,
    allowedExtensions = null
  } = options

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: fileSize,
      files: maxCount,
      fields: 10
    },
    fileFilter: createFileFilter(allowedMimeTypes, allowedExtensions)
  })

  return upload.array(fieldName, maxCount)
}

// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'Upload error'
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large'
        break
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files'
        break
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field'
        break
      case 'MISSING_FIELD_NAME':
        message = 'Missing field name'
        break
      default:
        message = error.message
    }

    return res.status(400).json({
      success: false,
      message,
      error: {
        type: 'UPLOAD_ERROR',
        code: error.code
      }
    })
  }

  if (error.message.includes('Invalid file')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: {
        type: 'FILE_VALIDATION_ERROR'
      }
    })
  }

  next(error)
}

// Validation middleware to check if file was uploaded
const requireFile = (fieldName = 'file') => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`
      })
    }
    next()
  }
}

// File info middleware - adds file metadata to response
const addFileInfo = (req, res, next) => {
  if (req.file) {
    req.fileInfo = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      sizeFormatted: formatFileSize(req.file.size),
      extension: path.extname(req.file.originalname).toLowerCase()
    }
  }

  if (req.files && Array.isArray(req.files)) {
    req.filesInfo = req.files.map(file => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      extension: path.extname(file.originalname).toLowerCase()
    }))
  }

  next()
}

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

module.exports = {
  createUploadMiddleware,
  uploadDocument,
  uploadResume,
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadMultiple,
  handleUploadError,
  requireFile,
  addFileInfo,
  formatFileSize
}
