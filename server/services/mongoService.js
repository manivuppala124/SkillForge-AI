const mongoose = require('mongoose')

class MongoService {
  // Generic CRUD operations for MongoDB collections with error handling and optimization
  
  static async create(Model, data, options = {}) {
    try {
      const document = new Model(data)
      
      // Validate before saving if requested
      if (options.validate !== false) {
        await document.validate()
      }
      
      const saved = await document.save(options.saveOptions || {})
      
      if (options.populate) {
        return await saved.populate(options.populate)
      }
      
      return saved
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message)
        throw new Error(`Validation failed: ${messages.join(', ')}`)
      } else if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]
        throw new Error(`Duplicate entry for field: ${field}`)
      }
      throw new Error(`Create operation failed: ${error.message}`)
    }
  }

  static async findById(Model, id, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId format')
      }

      let query = Model.findById(id)
      
      if (options.populate) {
        query = query.populate(options.populate)
      }
      
      if (options.select) {
        query = query.select(options.select)
      }
      
      if (options.lean) {
        query = query.lean()
      }

      const result = await query.exec()
      
      if (!result && options.required !== false) {
        throw new Error('Document not found')
      }
      
      return result
    } catch (error) {
      throw new Error(`Find by ID operation failed: ${error.message}`)
    }
  }

  static async findOne(Model, query, options = {}) {
    try {
      let mongoQuery = Model.findOne(query)
      
      if (options.populate) {
        mongoQuery = mongoQuery.populate(options.populate)
      }
      
      if (options.select) {
        mongoQuery = mongoQuery.select(options.select)
      }
      
      if (options.sort) {
        mongoQuery = mongoQuery.sort(options.sort)
      }
      
      if (options.lean) {
        mongoQuery = mongoQuery.lean()
      }

      const result = await mongoQuery.exec()
      
      if (!result && options.required) {
        throw new Error('Document not found')
      }
      
      return result
    } catch (error) {
      throw new Error(`Find one operation failed: ${error.message}`)
    }
  }

  static async findMany(Model, query = {}, options = {}) {
    try {
      let mongoQuery = Model.find(query)
      
      if (options.populate) {
        mongoQuery = mongoQuery.populate(options.populate)
      }
      
      if (options.select) {
        mongoQuery = mongoQuery.select(options.select)
      }
      
      if (options.sort) {
        mongoQuery = mongoQuery.sort(options.sort)
      }
      
      if (options.limit) {
        mongoQuery = mongoQuery.limit(parseInt(options.limit))
      }
      
      if (options.skip) {
        mongoQuery = mongoQuery.skip(parseInt(options.skip))
      }
      
      if (options.lean) {
        mongoQuery = mongoQuery.lean()
      }

      // Execute query
      const results = await mongoQuery.exec()
      
      // Get total count if pagination is requested
      if (options.pagination) {
        const total = await Model.countDocuments(query)
        const page = Math.floor((options.skip || 0) / (options.limit || 10)) + 1
        const totalPages = Math.ceil(total / (options.limit || 10))
        
        return {
          data: results,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: options.limit || 10,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      }

      return results
    } catch (error) {
      throw new Error(`Find many operation failed: ${error.message}`)
    }
  }

  static async updateById(Model, id, data, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId format')
      }

      const updateData = { 
        ...data, 
        updatedAt: new Date() 
      }

      const defaultOptions = {
        new: true,
        runValidators: true,
        context: 'query'
      }

      const result = await Model.findByIdAndUpdate(
        id, 
        updateData, 
        { ...defaultOptions, ...options.updateOptions }
      )
      
      if (!result) {
        throw new Error('Document not found')
      }

      if (options.populate) {
        return await result.populate(options.populate)
      }
      
      return result
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message)
        throw new Error(`Validation failed: ${messages.join(', ')}`)
      } else if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]
        throw new Error(`Duplicate entry for field: ${field}`)
      }
      throw new Error(`Update operation failed: ${error.message}`)
    }
  }

  static async updateMany(Model, query, data, options = {}) {
    try {
      const updateData = { 
        ...data, 
        updatedAt: new Date() 
      }

      const defaultOptions = {
        runValidators: true,
        context: 'query'
      }

      const result = await Model.updateMany(
        query, 
        updateData, 
        { ...defaultOptions, ...options.updateOptions }
      )
      
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged
      }
    } catch (error) {
      throw new Error(`Update many operation failed: ${error.message}`)
    }
  }

  static async deleteById(Model, id, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId format')
      }

      let result
      if (options.soft) {
        // Soft delete - mark as deleted instead of removing
        result = await Model.findByIdAndUpdate(
          id,
          { 
            isDeleted: true, 
            deletedAt: new Date() 
          },
          { new: true }
        )
      } else {
        result = await Model.findByIdAndDelete(id)
      }
      
      if (!result) {
        throw new Error('Document not found')
      }
      
      return result
    } catch (error) {
      throw new Error(`Delete operation failed: ${error.message}`)
    }
  }

  static async deleteMany(Model, query, options = {}) {
    try {
      let result
      if (options.soft) {
        // Soft delete - mark as deleted instead of removing
        result = await Model.updateMany(
          query,
          { 
            isDeleted: true, 
            deletedAt: new Date() 
          }
        )
        return {
          deletedCount: result.modifiedCount,
          acknowledged: result.acknowledged
        }
      } else {
        result = await Model.deleteMany(query)
      }
      
      return {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged
      }
    } catch (error) {
      throw new Error(`Delete many operation failed: ${error.message}`)
    }
  }

  static async aggregate(Model, pipeline, options = {}) {
    try {
      // Validate pipeline
      if (!Array.isArray(pipeline)) {
        throw new Error('Pipeline must be an array')
      }

      // Add common pipeline optimizations
      const optimizedPipeline = this.optimizePipeline(pipeline)
      
      let aggregation = Model.aggregate(optimizedPipeline)
      
      if (options.allowDiskUse) {
        aggregation = aggregation.allowDiskUse(true)
      }
      
      if (options.maxTimeMS) {
        aggregation = aggregation.option({ maxTimeMS: options.maxTimeMS })
      }

      const results = await aggregation.exec()
      
      return results
    } catch (error) {
      throw new Error(`Aggregation operation failed: ${error.message}`)
    }
  }

  // Pipeline optimization helper
  static optimizePipeline(pipeline) {
    const optimized = [...pipeline]
    
    // Move $match stages to the beginning when possible
    for (let i = 1; i < optimized.length; i++) {
      const stage = optimized[i]
      if (stage.$match) {
        // Check if this $match can be moved earlier
        let canMove = true
        for (let j = 0; j < i; j++) {
          const prevStage = optimized[j]
          if (prevStage.$addFields || prevStage.$project || prevStage.$set) {
            // Check if $match depends on computed fields
            const computedFields = Object.keys(
              prevStage.$addFields || prevStage.$project || prevStage.$set || {}
            )
            const matchFields = Object.keys(stage.$match)
            
            if (matchFields.some(field => computedFields.includes(field))) {
              canMove = false
              break
            }
          }
        }
        
        if (canMove && i > 0) {
          // Move $match to earlier position
          optimized.splice(i, 1)
          optimized.unshift(stage)
        }
      }
    }
    
    return optimized
  }

  // Analytics and statistics methods
  static async getUserStats(userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format')
      }

      const Quiz = require('../models/Quiz')
      const LearningPath = require('../models/LearningPath')
      const Resume = require('../models/Resume')

      const userObjectId = new mongoose.Types.ObjectId(userId)

      const [quizStats, learningStats, resumeCount] = await Promise.all([
        Quiz.aggregate([
          { $match: { userId: userObjectId, isActive: true } },
          { $unwind: { path: '$attempts', preserveNullAndEmptyArrays: true } },
          { $match: { 'attempts.completedAt': { $exists: true } } },
          {
            $group: {
              _id: null,
              totalQuizzes: { $addToSet: '$_id' },
              totalAttempts: { $sum: 1 },
              averageScore: { $avg: '$attempts.score.percentage' },
              totalTimeSpent: { $sum: '$attempts.timeSpent' }
            }
          },
          {
            $project: {
              totalQuizzes: { $size: '$totalQuizzes' },
              totalAttempts: 1,
              averageScore: { $round: ['$averageScore', 1] },
              totalTimeSpent: 1
            }
          }
        ]),
        
        LearningPath.aggregate([
          { $match: { userId: userObjectId, isActive: true } },
          {
            $group: {
              _id: null,
              totalPaths: { $sum: 1 },
              averageProgress: { $avg: '$progress.overallPercentage' },
              totalHoursSpent: { $sum: '$progress.hoursSpent' },
              completedModules: {
                $sum: {
                  $reduce: {
                    input: '$modules',
                    initialValue: 0,
                    in: {
                      $add: [
                        '$$value',
                        { $cond: [{ $eq: ['$$this.completed', true] }, 1, 0] }
                      ]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              totalPaths: 1,
              averageProgress: { $round: ['$averageProgress', 1] },
              totalHoursSpent: { $round: ['$totalHoursSpent', 1] },
              completedModules: 1
            }
          }
        ]),
        
        Resume.countDocuments({ userId: userObjectId })
      ])

      return {
        quizzes: quizStats[0] || { 
          totalQuizzes: 0, 
          totalAttempts: 0, 
          averageScore: 0, 
          totalTimeSpent: 0 
        },
        learning: learningStats || { 
          totalPaths: 0, 
          averageProgress: 0,
          totalHoursSpent: 0,
          completedModules: 0 
        },
        resumes: resumeCount
      }
    } catch (error) {
      throw new Error(`Stats calculation failed: ${error.message}`)
    }
  }

  // Database health check
  static async healthCheck() {
    try {
      const conn = mongoose.connection
    if (!conn || !conn.db) {
      return { status: 'unhealthy', error: 'No DB connection' }
    }
   const startTime = Date.now()
  await conn.db.admin().ping()
      const responseTime = Date.now() - startTime
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        readyState: mongoose.connection.readyState
      }
    }
  }

  // Transaction wrapper
  static async withTransaction(operations) {
    const session = await mongoose.startSession()
    
    try {
      const result = await session.withTransaction(async () => {
        return await operations(session)
      })
      
      return result
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`)
    } finally {
      await session.endSession()
    }
  }

  // Bulk operations
  static async bulkWrite(Model, operations, options = {}) {
    try {
      const result = await Model.bulkWrite(operations, {
        ordered: false,
        ...options
      })
      
      return {
        insertedCount: result.insertedCount,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        upsertedCount: result.upsertedCount
      }
    } catch (error) {
      throw new Error(`Bulk write operation failed: ${error.message}`)
    }
  }

  // Index management
  static async ensureIndexes(Model) {
    try {
      await Model.ensureIndexes()
      return true
    } catch (error) {
      throw new Error(`Index creation failed: ${error.message}`)
    }
  }
}

module.exports = MongoService
