const axios = require('axios')

class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY
    this.baseURL = 'https://api.perplexity.ai'
    this.aiCoreURL = process.env.AI_CORE_URL || 'http://localhost:8000'
    this.timeout = 30000 // 30 seconds
    this.retryAttempts = 3
    this.retryDelay = 1000 // 1 second
  }

  // Enhanced AI request method with retry logic
  async makeAIRequest(endpoint, data, retryCount = 0) {
    try {
      const response = await axios.post(`${this.aiCoreURL}${endpoint}`, data, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'AI request failed')
      }
    } catch (error) {
      console.error(`AI request error (attempt ${retryCount + 1}):`, error.message)

      if (retryCount < this.retryAttempts - 1 && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * (retryCount + 1))
        return this.makeAIRequest(endpoint, data, retryCount + 1)
      }

      throw error
    }
  }

  shouldRetry(error) {
    // Retry on network errors, timeouts, or 5xx server errors
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      (error.response && error.response.status >= 500)
    )
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async analyzeResumeWithAI(resumeText, targetRole = null) {
    try {
      console.log('🔍 Starting AI resume analysis...')
      
      const requestData = {
        text: resumeText,
        target_role: targetRole,
        analysis_type: 'comprehensive',
        include_suggestions: true,
        include_job_matching: true
      }

      const analysis = await this.makeAIRequest('/analyze-resume', requestData)
      
      return this.formatResumeAnalysis(analysis)
    } catch (error) {
      console.error('Resume analysis error:', error)
      return this.getFallbackResumeAnalysis(resumeText)
    }
  }

  async generateQuizWithAI(topic, difficulty, numQuestions = 10) {
    try {
      console.log(`🧠 Generating ${numQuestions} ${difficulty} questions for: ${topic}`)

      const requestData = {
        topic,
        difficulty,
        num_questions: numQuestions,
        question_types: ['multiple-choice', 'true-false'],
        include_explanations: true,
        randomize: true
      }

      const quizData = await this.makeAIRequest('/generate-quiz', requestData)
      
      return this.formatQuizData(quizData, topic)
    } catch (error) {
      console.error('Quiz generation error:', error)
      return this.getFallbackQuiz(topic, difficulty, numQuestions)
    }
  }

  async generateLearningPathWithAI(goal, timeline, currentSkills) {
    try {
      console.log(`🎯 Generating learning path for: ${goal}`)

      const requestData = {
        goal,
        timeline_days: timeline,
        current_skills: currentSkills,
        learning_style: 'mixed',
        difficulty_progression: true,
        include_resources: true,
        include_assessments: true
      }

      const pathData = await this.makeAIRequest('/generate-learning-path', requestData)
      
      return this.formatLearningPath(pathData)
    } catch (error) {
      console.error('Learning path generation error:', error)
      return this.getFallbackLearningPath(goal, timeline, currentSkills)
    }
  }

  async askTutor(question, context = null, subject = null) {
    try {
      console.log(`🎓 Processing tutor question: ${question.substring(0, 50)}...`)

      const requestData = {
        question,
        context: context || {},
        subject: subject || 'general',
        response_format: 'educational',
        include_examples: true,
        include_suggestions: true,
        difficulty_level: context?.userLevel || 'intermediate'
      }

      const response = await this.makeAIRequest('/tutor-ask', requestData)
      
      return this.formatTutorResponse(response)
    } catch (error) {
      console.error('Tutor service error:', error)
      return {
        answer: "I'm having trouble processing your question right now. Please try rephrasing your question or try again later.",
        suggestions: ['Try asking a more specific question', 'Check your internet connection'],
        error: true
      }
    }
  }

  // Enhanced formatting methods
  formatResumeAnalysis(aiData) {
    return {
      skills: {
        identified: aiData.skills?.identified || this.extractSkillsFromText(''),
        missing: aiData.skills?.missing || this.getCommonMissingSkills(),
        categories: aiData.skills?.categories || []
      },
      experience: {
        totalYears: aiData.experience?.total_years || 0,
        roles: aiData.experience?.roles || [],
        companies: aiData.experience?.companies || [],
        industries: aiData.experience?.industries || []
      },
      education: {
        degrees: aiData.education?.degrees || [],
        institutions: aiData.education?.institutions || [],
        certifications: aiData.education?.certifications || []
      },
      jobSuggestions: aiData.job_suggestions?.map(job => ({
        title: job.title,
        matchPercentage: job.match_percentage || 0,
        requirements: job.requirements || [],
        missingSkills: job.missing_skills || [],
        salaryRange: job.salary_range || { min: 0, max: 0, currency: 'USD' }
      })) || this.getJobSuggestions([]),
      recommendations: aiData.recommendations || this.getDefaultRecommendations(),
      score: {
        overall: aiData.score?.overall || 0,
        sections: {
          skills: aiData.score?.skills || 0,
          experience: aiData.score?.experience || 0,
          education: aiData.score?.education || 0,
          formatting: aiData.score?.formatting || 0
        }
      },
      aiInsights: {
        strengths: aiData.ai_insights?.strengths || [],
        improvements: aiData.ai_insights?.improvements || [],
        marketTrends: aiData.ai_insights?.market_trends || []
      }
    }
  }

  formatQuizData(aiData, topic) {
    return {
      title: aiData.title || `${topic} Quiz`,
      questions: aiData.questions?.map((q, index) => ({
        questionId: `q_${index + 1}`,
        question: q.question,
        type: q.type || 'multiple-choice',
        options: q.options || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || '',
        points: q.points || 1,
        tags: q.tags || [topic],
        difficulty: q.difficulty || 'medium'
      })) || [],
      timeLimit: aiData.time_limit || Math.max(aiData.questions?.length * 2, 10),
      passingScore: aiData.passing_score || 70,
      category: aiData.category || 'general'
    }
  }

  formatLearningPath(aiData) {
    return {
      title: aiData.title || 'Learning Path',
      description: aiData.description || '',
      targetSkills: aiData.target_skills || [],
      category: aiData.category || 'general',
      estimatedDuration: aiData.estimated_duration || '4-6 weeks',
      modules: aiData.modules?.map((module, index) => ({
        moduleId: `module_${index + 1}`,
        title: module.title,
        description: module.description,
        week: module.week || index + 1,
        order: index + 1,
        estimatedHours: module.estimated_hours || 5,
        skills: module.skills || [],
        prerequisites: module.prerequisites || [],
        learningObjectives: module.learning_objectives || [],
        resources: module.resources?.map((resource, rIndex) => ({
          resourceId: `res_${index + 1}_${rIndex + 1}`,
          title: resource.title,
          description: resource.description || '',
          url: resource.url || '',
          type: resource.type || 'article',
          duration: resource.duration || 30,
          difficulty: resource.difficulty || 'intermediate',
          provider: resource.provider || '',
          isPaid: resource.is_paid || false,
          rating: resource.rating || 0,
          tags: resource.tags || []
        })) || [],
        assessments: module.assessments || [],
        completed: false,
        completedAt: null
      })) || []
    }
  }

  formatTutorResponse(aiData) {
    return {
      answer: aiData.answer || 'No answer provided',
      keyPoints: aiData.key_points || [],
      examples: aiData.examples || [],
      suggestions: aiData.suggestions || [],
      relatedTopics: aiData.related_topics || [],
      nextSteps: aiData.next_steps || [],
      difficulty: aiData.difficulty || 'intermediate',
      sources: aiData.sources || [],
      resources: aiData.resources || []
    }
  }

  // Enhanced fallback methods
  getFallbackResumeAnalysis(resumeText) {
    const skills = this.extractSkillsFromText(resumeText)
    const experience = this.extractExperienceFromText(resumeText)
    const education = this.extractEducationFromText(resumeText)
    
    return {
      skills: {
        identified: skills,
        missing: this.getCommonMissingSkills(),
        categories: this.categorizeSkills(skills)
      },
      experience: {
        totalYears: experience.years,
        roles: experience.roles,
        companies: experience.companies,
        industries: experience.industries
      },
      education: {
        degrees: education.degrees,
        institutions: education.institutions,
        certifications: education.certifications
      },
      jobSuggestions: this.getJobSuggestions(skills),
      recommendations: this.getDefaultRecommendations(),
      score: {
        overall: this.calculateOverallScore(skills, experience, education),
        sections: {
          skills: Math.min(skills.length * 10, 100),
          experience: Math.min(experience.years * 15, 100),
          education: education.degrees.length > 0 ? 80 : 40,
          formatting: 70
        }
      },
      aiInsights: {
        strengths: this.identifyStrengths(skills, experience),
        improvements: this.getDefaultRecommendations(),
        marketTrends: this.getMarketTrends()
      }
    }
  }

  getFallbackQuiz(topic, difficulty, numQuestions) {
    const questions = []
    const questionTemplates = this.getQuestionTemplates(topic, difficulty)
    
    for (let i = 1; i <= numQuestions; i++) {
      const template = questionTemplates[i % questionTemplates.length]
      questions.push({
        questionId: `q_${i}`,
        question: template.question,
        type: 'multiple-choice',
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        points: 1,
        tags: [topic],
        difficulty
      })
    }

    return {
      title: `${topic} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
      questions,
      timeLimit: Math.max(numQuestions * 2, 10),
      passingScore: 70,
      category: 'technical'
    }
  }

  getFallbackLearningPath(goal, timeline, currentSkills) {
    const weeks = Math.ceil(timeline / 7)
    const modules = []
    const moduleTemplates = this.getModuleTemplates(goal)

    for (let week = 1; week <= Math.min(weeks, 12); week++) {
      const template = moduleTemplates[week % moduleTemplates.length]
      modules.push({
        moduleId: `module_${week}`,
        title: `Week ${week}: ${template.title}`,
        description: template.description,
        week,
        order: week,
        estimatedHours: template.estimatedHours || 5,
        skills: template.skills || [],
        prerequisites: week > 1 ? [`module_${week - 1}`] : [],
        learningObjectives: template.objectives || [],
        resources: template.resources || [
          {
            resourceId: `res_${week}_1`,
            title: `${goal} Fundamentals`,
            url: 'https://example.com',
            type: 'course',
            duration: 60,
            difficulty: 'intermediate'
          }
        ],
        assessments: [
          {
            type: 'quiz',
            title: `Week ${week} Assessment`,
            description: `Test your knowledge from week ${week}`,
            passingCriteria: '70% or higher'
          }
        ],
        completed: false
      })
    }

    return {
      title: `${goal} Learning Path`,
      description: `Complete learning path for ${goal} over ${timeline} days`,
      targetSkills: this.getTargetSkills(goal),
      category: this.categorizeGoal(goal),
      modules
    }
  }

  // Helper methods
  extractSkillsFromText(text) {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'mysql',
      'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'typescript',
      'angular', 'vue.js', 'express', 'fastapi', 'postgresql', 'redis',
      'graphql', 'rest api', 'microservices', 'agile', 'scrum', 'devops',
      'machine learning', 'data science', 'tensorflow', 'pytorch', 'pandas',
      'numpy', 'matplotlib', 'scikit-learn', 'django', 'flask', 'spring boot'
    ]

    const textLower = text.toLowerCase()
    const foundSkills = []

    skillKeywords.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1))
      }
    })

    return [...new Set(foundSkills)]
  }

  extractExperienceFromText(text) {
    // Simple extraction logic - in production, use more sophisticated NLP
    const yearMatches = text.match(/(\d+)\+?\s*years?/gi) || []
    const years = yearMatches.length > 0 ? parseInt(yearMatches[0]) : 0

    return {
      years,
      roles: ['Software Developer', 'Engineer'], // Placeholder
      companies: ['Tech Company'], // Placeholder
      industries: ['Technology'] // Placeholder
    }
  }

  extractEducationFromText(text) {
    const degrees = []
    const institutions = []
    const certifications = []

    // Simple keyword matching - enhance with proper NLP in production
    if (text.toLowerCase().includes('bachelor')) degrees.push('Bachelor\'s Degree')
    if (text.toLowerCase().includes('master')) degrees.push('Master\'s Degree')
    if (text.toLowerCase().includes('phd') || text.toLowerCase().includes('doctorate')) degrees.push('PhD')

    if (text.toLowerCase().includes('university')) institutions.push('University')
    if (text.toLowerCase().includes('college')) institutions.push('College')

    if (text.toLowerCase().includes('certification')) certifications.push('Certification')
          // Certifications placeholder
    if (text.toLowerCase().includes('certified')) certifications.push('Certification')
    
    return {
      degrees,
      institutions,
      certifications
    }
  }

  categorizeSkills(skills) {
    // Simple categorization based on skill keywords
    const categories = {
      'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'],
      'Frontend': ['React', 'Angular', 'Vue.js', 'HTML', 'CSS'],
      'Backend': ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot'],
      'Databases': ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis'],
      'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Terraform'],
      'Data Science': ['Pandas', 'NumPy', 'TensorFlow', 'scikit-learn']
    }

    const result = []
    for (const [category, keywords] of Object.entries(categories)) {
      const matched = skills.filter(skill => keywords.includes(skill))
      if (matched.length) {
        result.push({ name: category, skills: matched, proficiency: 'Intermediate' })
      }
    }
    return result
  }

  calculateOverallScore(skills, experience, education) {
    // Weighted scoring
    const skillScore = Math.min(skills.length * 10, 40)
    const expScore = Math.min(experience.years * 10, 30)
    const eduScore = education.degrees.length * 10
    return Math.min(skillScore + expScore + eduScore, 100)
  }

  identifyStrengths(skills, experience) {
    const strengths = []
    if (skills.length > 5) strengths.push('Strong skill set')
    if (experience.years > 2) strengths.push('Solid experience')
    return strengths
  }

  getMarketTrends() {
    return [
      'AI and Machine Learning',
      'Cloud Native Development',
      'Microservices Architecture',
      'DevOps and CI/CD'
    ]
  }

  getCommonMissingSkills() {
    return ['Docker', 'AWS', 'Kubernetes', 'TypeScript', 'GraphQL']
  }

  getJobSuggestions(skills) {
    const baseSuggestions = [
      { title: 'Frontend Developer', match: 85, requirements: ['React', 'JavaScript', 'CSS'] },
      { title: 'Full Stack Developer', match: 78, requirements: ['React', 'Node.js', 'MongoDB'] },
      { title: 'Backend Developer', match: 72, requirements: ['Node.js', 'APIs', 'Databases'] }
    ]
    return baseSuggestions.map(job => ({
      ...job,
      missingSkills: job.requirements.filter(req => !skills.includes(req))
    }))
  }

  getDefaultRecommendations() {
    return [
      'Add quantifiable achievements',
      'Include relevant certifications',
      'Optimize for ATS with keywords',
      'Highlight key projects'
    ]
  }

  getQuestionTemplates(topic, difficulty) {
    // Example templates for fallback quiz
    return [
      {
        question: `What is the purpose of ${topic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `The purpose of ${topic} is...`
      },
      {
        question: `Which of the following is true about ${topic}?`,
        options: ['True A', 'True B', 'True C', 'True D'],
        correctAnswer: 1,
        explanation: `${topic} true statement is...`
      }
    ]
  }

  getModuleTemplates(goal) {
    // Example templates for fallback learning path
    return [
      {
        title: `${goal} Basics`,
        description: `Introduction to ${goal}`,
        estimatedHours: 5,
        skills: [goal, `${goal} fundamentals`],
        objectives: [`Understand ${goal} basics`],
        resources: [
          {
            title: `${goal} Getting Started`,
            url: 'https://example.com',
            type: 'article',
            duration: 30,
            difficulty: 'beginner'
          }
        ]
      },
      {
        title: `${goal} Intermediate`,
        description: `Deep dive into ${goal}`,
        estimatedHours: 7,
        skills: [`Advanced ${goal}`, `${goal} concepts`],
        objectives: [`Master ${goal} intermediate topics`],
        resources: [
          {
            title: `${goal} Deep Dive`,
            url: 'https://example.com',
            type: 'video',
            duration: 45,
            difficulty: 'intermediate'
          }
        ]
      }
    ]
  }

  getTargetSkills(goal) {
    // Derive target skills from goal
    return goal.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
  }

  categorizeGoal(goal) {
    // Simple categorization
    const lower = goal.toLowerCase()
    if (lower.includes('data')) return 'data-science'
    if (lower.includes('web')) return 'programming'
    return 'other'
  }
}

module.exports = {
  analyzeResumeWithAI: (text, role) => new PerplexityService().analyzeResumeWithAI(text, role),
  generateQuizWithAI: (topic, difficulty, num) => new PerplexityService().generateQuizWithAI(topic, difficulty, num),
  generateLearningPathWithAI: (goal, timeline, skills) => new PerplexityService().generateLearningPathWithAI(goal, timeline, skills),
  askTutor: (question, context, subject) => new PerplexityService().askTutor(question, context, subject)
}
