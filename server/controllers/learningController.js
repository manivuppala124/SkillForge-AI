const LearningPath = require('../models/LearningPath')
const User = require('../models/User')
const { generateLearningPathWithAI } = require('../services/perplexityService')
const Helpers = require('../utils/helpers')

// @desc    Generate learning path
// @route   POST /api/learning/generate-path
const generateLearningPath = async (req, res) => {
  try {
    const { 
      goal, 
      timeline, 
      currentSkills = [], 
      difficulty = 'beginner',
      hoursPerWeek = 10 
    } = req.body
    const userId = req.user.id

    // Validation
    if (!goal || !timeline) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Goal and timeline are required')
      )
    }

    if (timeline < 7) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Timeline must be at least 7 days')
      )
    }

    console.log(`🚀 Generating learning path for user ${userId}: ${goal}`)

    // Generate learning path with AI
    const pathData = await generateLearningPathWithAI(goal, timeline, currentSkills)

    // Deactivate existing active paths for this user
    await LearningPath.updateMany(
      { userId, isActive: true }, 
      { isActive: false }
    )

    // Create new learning path
    const learningPath = new LearningPath({
      userId,
      title: pathData.title || `${goal} Learning Path`,
      description: pathData.description || `Complete learning path for ${goal}`,
      goal,
      timeline: {
        totalDays: timeline,
        hoursPerWeek,
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + (timeline * 24 * 60 * 60 * 1000))
      },
      difficulty,
      currentSkills,
      targetSkills: pathData.targetSkills || [],
      modules: pathData.modules.map((module, index) => ({
        ...module,
        order: index + 1,
        progress: {
          resourcesCompleted: 0,
          totalResources: module.resources?.length || 0,
          percentage: 0
        }
      })),
      category: pathData.category || 'other'
    })

    await learningPath.save()

    // Update user's learning path count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'progress.skillsLearned': 0 } // Initialize if needed
    })

    console.log(`✅ Learning path created successfully: ${learningPath._id}`)

    res.json(
      Helpers.formatResponse(true, {
        learningPath: {
          id: learningPath._id,
          title: learningPath.title,
          description: learningPath.description,
          goal: learningPath.goal,
          timeline: learningPath.timeline,
          difficulty: learningPath.difficulty,
          modules: learningPath.modules,
          progress: learningPath.progress
        }
      }, 'Learning path generated successfully')
    )
  } catch (error) {
    console.error('Generate learning path error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error generating learning path', error.message)
    )
  }
}

// @desc    Get learning path
// @route   GET /api/learning/path/:userId
const getLearningPath = async (req, res) => {
  try {
    const userId = req.params.userId

    // Validate user access
    if (userId !== req.user.id.toString()) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Access denied')
      )
    }

    const learningPath = await LearningPath.findOne({ 
      userId, 
      isActive: true 
    }).populate('userId', 'displayName email')

    if (!learningPath) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'No active learning path found')
      )
    }

    res.json(
      Helpers.formatResponse(true, { learningPath }, 'Learning path retrieved successfully')
    )
  } catch (error) {
    console.error('Get learning path error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Get all learning paths for user
// @route   GET /api/learning/paths/:userId
const getAllPaths = async (req, res) => {
  try {
    const userId = req.params.userId
    const { page = 1, limit = 10, status = 'all' } = req.query

    // Validate user access
    if (userId !== req.user.id.toString()) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Access denied')
      )
    }

    const query = { userId }
    if (status === 'active') query.isActive = true
    else if (status === 'inactive') query.isActive = false

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'userId',
        select: 'displayName email'
      }
    }

    const learningPaths = await LearningPath.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'displayName email')

    const total = await LearningPath.countDocuments(query)

    res.json(
      Helpers.formatResponse(true, {
        learningPaths,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }, 'Learning paths retrieved successfully')
    )
  } catch (error) {
    console.error('Get all paths error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Update progress
// @route   POST /api/learning/progress
const updateProgress = async (req, res) => {
  try {
    const { pathId, moduleId, action, resourceId, timeSpent = 0 } = req.body
    const userId = req.user.id

    if (!pathId || !moduleId || !action) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Path ID, module ID, and action are required')
      )
    }

    const learningPath = await LearningPath.findOne({ 
      _id: pathId, 
      userId 
    })

    if (!learningPath) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Learning path not found')
      )
    }

    const module = learningPath.modules.id(moduleId)
    if (!module) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Module not found')
      )
    }

    let updated = false

    switch (action) {
      case 'complete_module':
        if (!module.completed) {
          module.completed = true
          module.completedAt = new Date()
          updated = true
          
          // Update user progress
          await User.findByIdAndUpdate(userId, {
            $inc: { 'progress.skillsLearned': 1 }
          })
        }
        break

      case 'uncomplete_module':
        if (module.completed) {
          module.completed = false
          module.completedAt = null
          updated = true
        }
        break

      case 'complete_resource':
        if (resourceId) {
          const currentCompleted = module.progress.resourcesCompleted
          const totalResources = module.resources.length
          
          if (currentCompleted < totalResources) {
            module.progress.resourcesCompleted += 1
            updated = true
          }
        }
        break

      case 'add_time':
        if (timeSpent > 0) {
          module.timeSpent += timeSpent
          updated = true
          
          // Update user's total study time
          await User.findByIdAndUpdate(userId, {
            $inc: { 'progress.totalHoursStudied': timeSpent / 60 }
          })
        }
        break

      case 'add_note':
        const { note } = req.body
        if (note) {
          module.notes = note
          updated = true
        }
        break

      default:
        return res.status(400).json(
          Helpers.formatResponse(false, null, 'Invalid action')
        )
    }

    if (updated) {
      await learningPath.save()
      
      console.log(`📈 Progress updated for path ${pathId}, module ${moduleId}, action: ${action}`)
    }

    res.json(
      Helpers.formatResponse(true, {
        learningPath: {
          id: learningPath._id,
          progress: learningPath.progress,
          modules: learningPath.modules
        }
      }, 'Progress updated successfully')
    )
  } catch (error) {
    console.error('Update progress error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error updating progress', error.message)
    )
  }
}

// @desc    Delete learning path
// @route   DELETE /api/learning/path/:pathId
const deletePath = async (req, res) => {
  try {
    const { pathId } = req.params
    const userId = req.user.id

    const learningPath = await LearningPath.findOneAndDelete({ 
      _id: pathId, 
      userId 
    })

    if (!learningPath) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Learning path not found')
      )
    }

    console.log(`🗑️ Learning path deleted: ${pathId}`)

    res.json(
      Helpers.formatResponse(true, null, 'Learning path deleted successfully')
    )
  } catch (error) {
    console.error('Delete path error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error deleting learning path', error.message)
    )
  }
}

// @desc    Get learning path by ID
// @route   GET /api/learning/path/details/:pathId
const getPathById = async (req, res) => {
  try {
    const { pathId } = req.params
    const userId = req.user.id

    const learningPath = await LearningPath.findOne({ 
      _id: pathId, 
      userId 
    }).populate('userId', 'displayName email')

    if (!learningPath) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Learning path not found')
      )
    }

    res.json(
      Helpers.formatResponse(true, { learningPath }, 'Learning path retrieved successfully')
    )
  } catch (error) {
    console.error('Get path by ID error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

module.exports = { 
  generateLearningPath, 
  getLearningPath, 
  getAllPaths,
  updateProgress,
  deletePath,
  getPathById
}
