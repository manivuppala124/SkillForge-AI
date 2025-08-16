const app = require('./app')
const mongoose = require('mongoose')
const MongoService = require('./services/mongoService')

const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n💀 Received ${signal}. Starting graceful shutdown...`)

  server.close(async (err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err)
      process.exit(1)
    }

    console.log('🔌 HTTP server closed')

    try {
      await mongoose.connection.close()
      console.log('🔌 MongoDB connection closed')
      console.log('✅ Graceful shutdown completed')
      process.exit(0)
    } catch (mongoErr) {
      console.error('❌ Error closing MongoDB connection:', mongoErr)
      process.exit(1)
    }
  })

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 30000)
}

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start the server
const server = app.listen(PORT, async () => {
  console.log('\n🚀 SkillForge AI Server Started')
  console.log('================================')
  console.log(`📱 Environment: ${NODE_ENV}`)
  console.log(`🌐 Port: ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
  console.log('================================')

  // Only do a DB health check if already connected
  if (mongoose.connection.readyState === 1) {
    try {
      const dbHealth = await MongoService.healthCheck()
      if (dbHealth.status === 'healthy') {
        console.log(`✅ Database: Connected (${dbHealth.responseTime})`)
      } else {
        console.log(`❌ Database: ${dbHealth.error}`)
      }
    } catch (error) {
      console.log(`❌ Database health check failed: ${error.message}`)
    }
  } else {
    console.log('⏳ MongoDB not connected yet...')
  }

  // Log available routes in development
  if (NODE_ENV === 'development') {
    console.log('\n📋 Available Routes:')
    console.log('├── POST   /api/auth/register')
    console.log('├── POST   /api/auth/login')
    console.log('├── GET    /api/auth/profile')
    console.log('├── POST   /api/learning/generate-path')
    console.log('├── POST   /api/quiz/generate')
    console.log('├── POST   /api/resume/upload')
    console.log('├── POST   /api/tutor/ask')
    console.log('└── POST   /api/portfolio/generate')
    console.log('')
  }

  console.log('🎯 Server ready to handle requests!')
})

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`)
  } else {
    console.error('❌ Server error:', error)
  }
  process.exit(1)
})

module.exports = server
