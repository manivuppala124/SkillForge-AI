// ===== server/config/database.js =====
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // Set connection options
    const options = {
       maxPoolSize: 10,
       serverSelectionTimeoutMS: 5000,
       socketTimeoutMS: 45000,
       family: 4
     }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('🔌 MongoDB connection closed through app termination')
        process.exit(0)
      } catch (error) {
        console.error('Error during MongoDB shutdown:', error)
        process.exit(1)
      }
    })

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
