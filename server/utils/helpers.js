// ===== server/utils/helpers.js =====
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

class Helpers {
  // Generate unique IDs
  static generateId() {
    return crypto.randomBytes(16).toString('hex')
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Generate JWT token
  static generateJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
  }

  // Verify JWT token
  static verifyJWT(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  // Format response
  static formatResponse(success, data = null, message = null, error = null) {
    return {
      success,
      data,
      message,
      error,
      timestamp: new Date().toISOString()
    }
  }

  // Calculate learning path progress
  static calculateProgress(modules) {
    if (!modules || modules.length === 0) return 0
    
    const completedModules = modules.filter(module => module.completed).length
    return Math.round((completedModules / modules.length) * 100)
  }

  // Extract skills from text using regex
  static extractSkillsFromText(text) {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'mysql',
      'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'typescript',
      'angular', 'vue.js', 'express', 'fastapi', 'postgresql', 'redis',
      'graphql', 'rest api', 'microservices', 'agile', 'scrum'
    ]

    const textLower = text.toLowerCase()
    const foundSkills = []

    skillKeywords.forEach(skill => {
      if (textLower.includes(skill)) {
        foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1))
      }
    })

    return [...new Set(foundSkills)] // Remove duplicates
  }

  // Generate slug from text
  static generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Validate file upload
  static validateFileUpload(file, allowedTypes = ['application/pdf'], maxSize = 5 * 1024 * 1024) {
    if (!file) {
      throw new Error('No file provided')
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`)
    }

    return true
  }

  // Rate limiting helper
  static createRateLimiter(windowMs = 15 * 60 * 1000, max = 100) {
    const requests = new Map()
    
    return (req, res, next) => {
      const key = req.ip
      const now = Date.now()
      
      // Clean old entries
      for (const [ip, data] of requests.entries()) {
        if (now - data.resetTime > windowMs) {
          requests.delete(ip)
        }
      }
      
      // Check current requests
      const currentRequests = requests.get(key)
      
      if (!currentRequests) {
        requests.set(key, { count: 1, resetTime: now })
        return next()
      }
      
      if (currentRequests.count >= max) {
        return res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((windowMs - (now - currentRequests.resetTime)) / 1000)
        })
      }
      
      currentRequests.count++
      next()
    }
  }

  // Error handler
  static handleError(error, req, res, next) {
    console.error('Error:', error)

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      })
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found'
      })
    }

    // Default error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

module.exports = Helpers