const { askTutor } = require('../services/perplexityService')
const User = require('../models/User')
const Helpers = require('../utils/helpers')

// @desc    Ask AI tutor a question
// @route   POST /api/tutor/ask
const askTutorQuestion = async (req, res) => {
  try {
    const { question, context, subject } = req.body
    const userId = req.user.id

    // Validation
    if (!question || question.trim().length < 5) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Question must be at least 5 characters long')
      )
    }

    if (question.length > 1000) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Question is too long. Please keep it under 1000 characters.')
      )
    }

    console.log(`🎓 Tutor question from user ${userId}: ${question.substring(0, 50)}...`)

    // Get user context for personalized responses
    const user = await User.findById(userId).select('profile progress')
    const userContext = {
      domain: user?.profile?.domain || 'General',
      skillLevel: user?.profile?.skillLevel || 'Beginner',
      currentSkills: user?.profile?.currentSkills || []
    }

    // Combine context
    const fullContext = {
      ...userContext,
      userProvidedContext: context,
      subject: subject || 'General'
    }

    // Ask AI tutor
    const response = await askTutor(question, fullContext, subject)

    // Update user's activity
    await User.findByIdAndUpdate(userId, {
      'progress.lastActivity': new Date()
    })

    console.log(`✅ Tutor response generated for user ${userId}`)

    res.json(
      Helpers.formatResponse(true, {
        answer: response.answer,
        suggestions: response.suggestions || [],
        relatedTopics: response.relatedTopics || [],
        difficulty: response.difficulty || 'intermediate',
        sources: response.sources || []
      }, 'Answer generated successfully')
    )
  } catch (error) {
    console.error('Ask tutor error:', error)
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json(
        Helpers.formatResponse(false, null, 'Too many questions. Please wait a moment before asking again.')
      )
    }

    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error generating answer', error.message)
    )
  }
}

// @desc    Get tutor conversation history
// @route   GET /api/tutor/history/:userId
const getTutorHistory = async (req, res) => {
  try {
    const userId = req.params.userId
    const { page = 1, limit = 20, subject } = req.query

    // Validate user access
    if (userId !== req.user.id.toString()) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Access denied')
      )
    }

    // For now, return empty history as we're not storing conversations
    // In a production system, you'd want to store conversation history
    const history = []
    
    // This would be implemented with a TutorConversation model
    // const query = { userId }
    // if (subject) query.subject = subject
    
    // const conversations = await TutorConversation.find(query)
    //   .sort({ createdAt: -1 })
    //   .limit(limit * 1)
    //   .skip((page - 1) * limit)

    res.json(
      Helpers.formatResponse(true, {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      }, 'Tutor history retrieved successfully')
    )
  } catch (error) {
    console.error('Get tutor history error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Explain a topic
// @route   POST /api/tutor/explain
const explainTopic = async (req, res) => {
  try {
    const { topic, level = 'beginner', detail = 'medium' } = req.body
    const userId = req.user.id

    if (!topic || topic.trim().length < 2) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Topic is required')
      )
    }

    console.log(`📚 Topic explanation request from user ${userId}: ${topic}`)

    // Get user context
    const user = await User.findById(userId).select('profile')
    const userSkillLevel = user?.profile?.skillLevel?.toLowerCase() || level

    // Create explanation request
    const question = `Please explain "${topic}" at a ${userSkillLevel} level with ${detail} detail.`
    
    const context = {
      type: 'explanation',
      level: userSkillLevel,
      detail,
      userDomain: user?.profile?.domain || 'General'
    }

    const response = await askTutor(question, context, topic)

    res.json(
      Helpers.formatResponse(true, {
        explanation: response.answer,
        keyPoints: response.keyPoints || [],
        examples: response.examples || [],
        nextSteps: response.nextSteps || [],
        relatedTopics: response.relatedTopics || []
      }, 'Topic explanation generated successfully')
    )
  } catch (error) {
    console.error('Explain topic error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error generating explanation', error.message)
    )
  }
}

// @desc    Generate study material
// @route   POST /api/tutor/generate-study-material
const generateStudyMaterial = async (req, res) => {
  try {
    const { topic, materialType = 'notes', duration = 30 } = req.body
    const userId = req.user.id

    if (!topic) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Topic is required')
      )
    }

    const allowedTypes = ['notes', 'flashcards', 'summary', 'outline', 'practice-questions']
    if (!allowedTypes.includes(materialType)) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, `Material type must be one of: ${allowedTypes.join(', ')}`)
      )
    }

    console.log(`📋 Study material generation for user ${userId}: ${topic} (${materialType})`)

    // Get user context
    const user = await User.findById(userId).select('profile')
    
    const context = {
      type: 'study-material',
      materialType,
      duration: `${duration} minutes`,
      userLevel: user?.profile?.skillLevel || 'beginner',
      userDomain: user?.profile?.domain || 'General'
    }

    let question = `Generate ${materialType} for studying "${topic}"`
    
    switch (materialType) {
      case 'notes':
        question = `Create comprehensive study notes for "${topic}" suitable for ${duration} minutes of study.`
        break
      case 'flashcards':
        question = `Create flashcards with questions and answers for "${topic}".`
        break
      case 'summary':
        question = `Create a concise summary of key points for "${topic}".`
        break
      case 'outline':
        question = `Create a detailed study outline for "${topic}".`
        break
      case 'practice-questions':
        question = `Generate practice questions and answers for "${topic}".`
        break
    }

    const response = await askTutor(question, context, topic)

    res.json(
      Helpers.formatResponse(true, {
        material: response.answer,
        type: materialType,
        topic,
        estimatedStudyTime: duration,
        additionalResources: response.resources || [],
        difficulty: response.difficulty || 'intermediate'
      }, `${materialType} generated successfully`)
    )
  } catch (error) {
    console.error('Generate study material error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error generating study material', error.message)
    )
  }
}

// @desc    Get study suggestions
// @route   GET /api/tutor/suggestions/:userId
const getStudySuggestions = async (req, res) => {
  try {
    const userId = req.params.userId

    // Validate user access
    if (userId !== req.user.id.toString()) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Access denied')
      )
    }

    const user = await User.findById(userId).select('profile progress')
    
    if (!user) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'User not found')
      )
    }

    // Generate personalized suggestions based on user's profile and progress
    const suggestions = {
      topics: [],
      resources: [],
      nextSteps: []
    }

    // Based on user's domain and current skills
    const domain = user.profile?.domain
    const skillLevel = user.profile?.skillLevel
    const currentSkills = user.profile?.currentSkills || []

    if (domain === 'Web Development') {
      suggestions.topics = [
        'React.js fundamentals',
        'Node.js backend development', 
        'Database design',
        'API development',
        'Frontend optimization'
      ]
    } else if (domain === 'Data Science') {
      suggestions.topics = [
        'Python for data analysis',
        'Machine learning basics',
        'Data visualization',
        'Statistical analysis',
        'SQL for data science'
      ]
    } else {
      suggestions.topics = [
        'Programming fundamentals',
        'Problem-solving techniques',
        'Software development lifecycle',
        'Version control with Git',
        'Testing and debugging'
      ]
    }

    // Filter suggestions based on current skills
    suggestions.topics = suggestions.topics.filter(topic => 
      !currentSkills.some(skill => 
        topic.toLowerCase().includes(skill.toLowerCase())
      )
    )

    suggestions.resources = [
      'Interactive coding exercises',
      'Video tutorials',
      'Practice projects',
      'Community forums',
      'Documentation guides'
    ]

    suggestions.nextSteps = [
      'Take a quiz to assess current knowledge',
      'Start a structured learning path',
      'Join a study group',
      'Work on a practical project',
      'Get resume feedback'
    ]

    res.json(
      Helpers.formatResponse(true, { suggestions }, 'Study suggestions retrieved successfully')
    )
  } catch (error) {
    console.error('Get study suggestions error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

module.exports = { 
  askTutorQuestion, 
  getTutorHistory,
  explainTopic,
  generateStudyMaterial,
  getStudySuggestions
}
