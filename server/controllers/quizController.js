const Quiz = require('../models/Quiz')
const User = require('../models/User')
const { generateQuizWithAI } = require('../services/perplexityService')
const Helpers = require('../utils/helpers')

// @desc    Generate quiz
// @route   POST /api/quiz/generate
const generateQuiz = async (req, res) => {
  try {
    const { 
      topic, 
      difficulty, 
      numQuestions = 10, 
      category = 'technical',
      timeLimit = 30
    } = req.body
    const userId = req.user.id

    // Validation
    if (!topic || !difficulty) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Topic and difficulty are required')
      )
    }

    if (numQuestions < 5 || numQuestions > 50) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Number of questions must be between 5 and 50')
      )
    }

    console.log(`🧠 Generating quiz for user ${userId}: ${topic} (${difficulty})`)

    // Generate quiz with AI
    const quizData = await generateQuizWithAI(topic, difficulty, numQuestions)

    // Create quiz
    const quiz = new Quiz({
      userId,
      title: quizData.title || `${topic} Quiz`,
      topic: topic.trim(),
      difficulty,
      category,
      questions: quizData.questions.map((q, index) => ({
        questionId: `q_${index + 1}`,
        question: q.question,
        type: q.type || 'multiple-choice',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 1,
        tags: q.tags || [topic]
      })),
      settings: {
        timeLimit: Math.max(timeLimit, Math.ceil(numQuestions * 2)), // At least 2 minutes per question
        passingScore: quizData.passingScore || 70,
        shuffleQuestions: true,
        showCorrectAnswers: true,
        allowRetakes: true,
        maxAttempts: 3
      },
      isActive: true
    })

    await quiz.save()

    console.log(`✅ Quiz created successfully: ${quiz._id}`)

    // Return quiz without correct answers for security
    const quizResponse = {
      id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      category: quiz.category,
      questions: quiz.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
        tags: q.tags
      })),
      settings: quiz.settings,
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0)
    }

    res.json(
      Helpers.formatResponse(true, { quiz: quizResponse }, 'Quiz generated successfully')
    )
  } catch (error) {
    console.error('Generate quiz error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error generating quiz', error.message)
    )
  }
}

// @desc    Get quiz by ID
// @route   GET /api/quiz/:quizId
const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const userId = req.user.id

    const quiz = await Quiz.findOne({ 
      _id: quizId, 
      userId,
      isActive: true 
    })

    if (!quiz) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Quiz not found')
      )
    }

    // Return quiz without correct answers for security
    const quizResponse = {
      id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      category: quiz.category,
      questions: quiz.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points,
        tags: q.tags
      })),
      settings: quiz.settings,
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      attempts: quiz.attempts.length,
      analytics: quiz.analytics
    }

    res.json(
      Helpers.formatResponse(true, { quiz: quizResponse }, 'Quiz retrieved successfully')
    )
  } catch (error) {
    console.error('Get quiz error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Submit quiz
// @route   POST /api/quiz/submit
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body
    const userId = req.user.id

    // Validation
    if (!quizId || !answers) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Quiz ID and answers are required')
      )
    }

    const quiz = await Quiz.findOne({ 
      _id: quizId, 
      userId,
      isActive: true 
    })

    if (!quiz) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Quiz not found')
      )
    }

    // Check attempt limits
    if (quiz.attempts.length >= quiz.settings.maxAttempts) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Maximum attempts reached')
      )
    }

    // Validate time spent
    const maxTime = quiz.settings.timeLimit * 60 // Convert to seconds
    if (timeSpent > maxTime + 60) { // Allow 1 minute buffer
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Time limit exceeded')
      )
    }

    console.log(`📝 Processing quiz submission for user ${userId}, quiz ${quizId}`)

    // Process answers and calculate score
    const attempt = quiz.addAttempt(answers, timeSpent || 0)
    await quiz.save()

    // Update user progress
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        'progress.quizzesCompleted': 1,
        'progress.totalHoursStudied': (timeSpent || 0) / 3600 // Convert seconds to hours
      }
    })

    // Prepare detailed results
    const results = {
      attemptId: attempt.attemptId,
      score: attempt.score,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt,
      questions: quiz.questions.map(question => {
        const userAnswer = attempt.userAnswers.find(ua => ua.questionId === question.questionId)
        return {
          questionId: question.questionId,
          question: question.question,
          options: question.options,
          correctAnswer: quiz.settings.showCorrectAnswers ? question.correctAnswer : null,
          userAnswer: userAnswer ? userAnswer.selectedAnswer : null,
          isCorrect: userAnswer ? userAnswer.isCorrect : false,
          explanation: quiz.settings.showCorrectAnswers ? question.explanation : null,
          points: question.points
        }
      }),
      analytics: {
        totalAttempts: quiz.attempts.length,
        bestScore: Math.max(...quiz.attempts.map(a => a.score.percentage)),
        averageScore: quiz.analytics.averageScore,
        timeComparison: {
          yourTime: attempt.timeSpent,
          averageTime: quiz.analytics.averageTimeSpent
        }
      }
    }

    console.log(`✅ Quiz submitted successfully. Score: ${attempt.score.percentage}%`)

    res.json(
      Helpers.formatResponse(true, { results }, 'Quiz submitted successfully')
    )
  } catch (error) {
    console.error('Submit quiz error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error submitting quiz', error.message)
    )
  }
}

// @desc    Get quiz history
// @route   GET /api/quiz/history/:userId
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.params.userId
    const { page = 1, limit = 10, difficulty, topic } = req.query

    // Validate user access
    if (userId !== req.user.id.toString()) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Access denied')
      )
    }

    // Build query
    const query = { userId, isActive: true }
    if (difficulty) query.difficulty = difficulty
    if (topic) query.topic = new RegExp(topic, 'i')

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title topic difficulty category attempts analytics createdAt')

    const total = await Quiz.countDocuments(query)

    // Format response with attempt summaries
    const quizHistory = quizzes.map(quiz => {
      const bestAttempt = quiz.attempts.length > 0 
        ? quiz.attempts.reduce((best, current) => 
            current.score.percentage > best.score.percentage ? current : best
          )
        : null

      return {
        id: quiz._id,
        title: quiz.title,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        category: quiz.category,
        createdAt: quiz.createdAt,
        attempts: {
          total: quiz.attempts.length,
          best: bestAttempt ? {
            score: bestAttempt.score.percentage,
            passed: bestAttempt.passed,
            completedAt: bestAttempt.completedAt
          } : null
        },
        analytics: quiz.analytics
      }
    })

    res.json(
      Helpers.formatResponse(true, {
        quizzes: quizHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }, 'Quiz history retrieved successfully')
    )
  } catch (error) {
    console.error('Get quiz history error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Get quiz statistics
// @route   GET /api/quiz/stats/:userId
const getQuizStats = async (req, res) => {
  try {
    const userId = req.params.userId

    // Validate user access
    if (userId !== req.user.id.toString()) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Access denied')
      )
    }

    const stats = await Quiz.aggregate([
      { $match: { userId: new require('mongoose').Types.ObjectId(userId), isActive: true } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: { $size: '$attempts' } },
          averageScore: { $avg: '$analytics.averageScore' },
          quizzesByDifficulty: {
            $push: '$difficulty'
          },
          quizzesByTopic: {
            $push: '$topic'
          }
        }
      }
    ])

    const userStats = stats[0] || {
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      quizzesByDifficulty: [],
      quizzesByTopic: []
    }

    // Count by difficulty and topic
    const difficultyCount = {}
    const topicCount = {}

    userStats.quizzesByDifficulty.forEach(diff => {
      difficultyCount[diff] = (difficultyCount[diff] || 0) + 1
    })

    userStats.quizzesByTopic.forEach(topic => {
      topicCount[topic] = (topicCount[topic] || 0) + 1
    })

    const finalStats = {
      summary: {
        totalQuizzes: userStats.totalQuizzes,
        totalAttempts: userStats.totalAttempts,
        averageScore: Math.round(userStats.averageScore || 0),
        completionRate: userStats.totalQuizzes > 0 ? Math.round((userStats.totalAttempts / userStats.totalQuizzes) * 100) : 0
      },
      byDifficulty: difficultyCount,
      topTopics: Object.entries(topicCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }))
    }

    res.json(
      Helpers.formatResponse(true, { stats: finalStats }, 'Quiz statistics retrieved successfully')
    )
  } catch (error) {
    console.error('Get quiz stats error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Delete quiz
// @route   DELETE /api/quiz/:quizId
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const userId = req.user.id

    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, userId },
      { isActive: false },
      { new: true }
    )

    if (!quiz) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Quiz not found')
      )
    }

    console.log(`🗑️ Quiz deactivated: ${quizId}`)

    res.json(
      Helpers.formatResponse(true, null, 'Quiz deleted successfully')
    )
  } catch (error) {
    console.error('Delete quiz error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error deleting quiz', error.message)
    )
  }
}

module.exports = { 
  generateQuiz, 
  getQuiz,
  submitQuiz, 
  getQuizHistory, 
  getQuizStats,
  deleteQuiz
}
