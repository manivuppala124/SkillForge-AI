const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const morgan = require('morgan')
const dotenv = require('dotenv')
const path = require('path')
const connectDB = require('./config/database')
const Helpers = require('./utils/helpers')

// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// Trust proxy (important for rate limiting behind load balancers)
app.set('trust proxy', process.env.TRUST_PROXY || 1)

// Security middleware - Helmet (must be early in middleware stack)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false // Allow file uploads
}))

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://skillforge.ai',
      'https://www.skillforge.ai',
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else if (process.env.NODE_ENV === 'development') {
      // Allow all origins in development
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Api-Key'
  ],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
}

app.use(cors(corsOptions))

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }))
} else {
  app.use(morgan('dev'))
}

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  level: 6,
  threshold: 1024
}))

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: process.env.JSON_LIMIT || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.URL_ENCODED_LIMIT || '10mb',
  parameterLimit: 20
}))

// Security middleware - Data sanitization
app.use(mongoSanitize({
  replaceWith: '_',
  allowDots: false
}))

app.use(xss())

// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: ['tags', 'skills', 'categories'] // Allow arrays for specific fields
}))

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    message,
    retryAfter: Math.ceil(windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      current: req.rateLimit.current,
      remaining: req.rateLimit.remaining
    })
  },
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  }
})

// Progressive delay for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  delayAfter: 50,             // allow 50 requests at full speed
  delayMs: () => 500,         // fixed 500ms delay per request after limit
  maxDelayMs: 20000,
  skipFailedRequests: true
})


// Global rate limiting
const globalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.GLOBAL_RATE_LIMIT || 200,
  'Too many requests from this IP, please try again later'
)

// Apply global middleware
app.use(speedLimiter)
app.use(globalLimiter)

// API-specific rate limiting for /api routes
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes  
  process.env.API_RATE_LIMIT || 100,
  'API rate limit exceeded, please try again later'
)

app.use('/api', apiLimiter)

// Security headers for API responses
app.use('/api', (req, res, next) => {
  res.setHeader('X-API-Version', '1.0')
  res.setHeader('X-Response-Time', Date.now())
  next()
})

// Routes with enhanced security
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/resume', require('./routes/resumeRoutes'))
app.use('/api/quiz', require('./routes/quizRoutes'))
app.use('/api/learning', require('./routes/learningRoutes'))
app.use('/api/tutor', require('./routes/tutorRoutes'))
app.use('/api/portfolio', require('./routes/portfolioRoutes'))

// Health check endpoint with system status
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'SkillForge AI Server Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    }
  }

  // Add database status if available
  const mongoose = require('mongoose')
  if (mongoose.connection.readyState === 1) {
    healthStatus.database = {
      status: 'connected',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  } else {
    healthStatus.database = {
      status: 'disconnected',
      readyState: mongoose.connection.readyState
    }
  }

  res.status(200).json(healthStatus)
})

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'SkillForge AI API',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'AI-powered learning management system API',
    documentation: process.env.API_DOCS_URL || 'https://docs.skillforge.ai',
    endpoints: {
      auth: '/api/auth',
      resume: '/api/resume',
      quiz: '/api/quiz',
      learning: '/api/learning',
      tutor: '/api/tutor',
      portfolio: '/api/portfolio'
    },
    support: {
      email: 'support@skillforge.ai',
      docs: 'https://docs.skillforge.ai'
    }
  })
})

// Request validation middleware
app.use((req, res, next) => {
  // Validate content type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type')
    if (!contentType) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Content-Type header is required')
      )
    }
    
    const validContentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ]
    
    const isValid = validContentTypes.some(type => contentType.includes(type))
    if (!isValid) {
      return res.status(415).json(
        Helpers.formatResponse(false, null, 'Unsupported content type')
      )
    }
  }
  
  next()
})

// Security middleware for API routes
app.use('/api', (req, res, next) => {
  // Add request ID for tracking
  req.requestId = require('crypto').randomUUID()
  
  // Log API requests in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`[${req.requestId}] ${req.method} ${req.path} - ${req.ip}`)
  }
  
  // Add security headers
  res.setHeader('X-Request-ID', req.requestId)
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  next()
})

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  const errorId = require('crypto').randomUUID()
  console.error(`[ERROR-${errorId}] ${err.stack}`)
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json(
      Helpers.formatResponse(false, null, 'CORS policy violation', errorId)
    )
  }
  
  // Rate limiting error
  if (err.message === 'Too many requests') {
    return res.status(429).json(
      Helpers.formatResponse(false, null, 'Rate limit exceeded', errorId)
    )
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message)
    return res.status(400).json(
      Helpers.formatResponse(false, null, 'Validation failed', messages)
    )
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      Helpers.formatResponse(false, null, 'Invalid token', errorId)
    )
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(409).json(
      Helpers.formatResponse(false, null, `Duplicate entry for ${field}`, errorId)
    )
  }
  
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(
      Helpers.formatResponse(false, null, 'File size too large', errorId)
    )
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json(
      Helpers.formatResponse(false, null, 'Too many files', errorId)
    )
  }
  
  // Syntax errors in JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      Helpers.formatResponse(false, null, 'Invalid JSON format', errorId)
    )
  }
  
  // Default error response
  const statusCode = err.statusCode || err.status || 500
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Something went wrong'
  
  res.status(statusCode).json(
    Helpers.formatResponse(false, null, message, errorId)
  )
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json(
    Helpers.formatResponse(false, null, `API endpoint not found: ${req.method} ${req.path}`)
  )
})

// 404 handler for all other routes
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json(
      Helpers.formatResponse(false, null, 'API endpoint not found')
    )
  }
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`)
  
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

module.exports = app
