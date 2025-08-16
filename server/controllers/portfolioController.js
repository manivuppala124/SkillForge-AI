const Portfolio = require('../models/Portfolio')
const User = require('../models/User')
const { uploadToFirebase } = require('../services/fileService')
const Helpers = require('../utils/helpers')

// @desc    Generate/Create portfolio
// @route   POST /api/portfolio/generate
const generatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      personalInfo,
      sections = {},
      socialLinks = [],
      theme = {},
      template = 'modern'
    } = req.body

    // Validation
    if (!personalInfo || !personalInfo.name) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Personal information with name is required')
      )
    }

    // Check if user already has a portfolio
    let portfolio = await Portfolio.findOne({ userId })

    if (portfolio) {
      // Update existing portfolio
      portfolio.personalInfo = { ...portfolio.personalInfo, ...personalInfo }
      portfolio.sections = { ...portfolio.sections, ...sections }
      portfolio.socialLinks = socialLinks
      portfolio.theme = { ...portfolio.theme, ...theme }
      portfolio.template = template
      portfolio.version += 1
    } else {
      // Create new portfolio
      portfolio = new Portfolio({
        userId,
        template,
        personalInfo: {
          name: personalInfo.name,
          title: personalInfo.title || '',
          bio: personalInfo.bio || '',
          email: personalInfo.email || req.user.email,
          phone: personalInfo.phone || '',
          location: personalInfo.location || {},
          website: personalInfo.website || '',
          profileImage: personalInfo.profileImage || req.user.photoURL,
          resume: personalInfo.resume || ''
        },
        sections: {
          about: {
            enabled: sections.about?.enabled !== false,
            content: sections.about?.content || personalInfo.bio || '',
            order: sections.about?.order || 1
          },
          skills: {
            enabled: sections.skills?.enabled !== false,
            order: sections.skills?.order || 2,
            categories: sections.skills?.categories || []
          },
          experience: {
            enabled: sections.experience?.enabled !== false,
            order: sections.experience?.order || 3,
            items: sections.experience?.items || []
          },
          education: {
            enabled: sections.education?.enabled !== false,
            order: sections.education?.order || 4,
            items: sections.education?.items || []
          },
          projects: {
            enabled: sections.projects?.enabled !== false,
            order: sections.projects?.order || 5,
            items: sections.projects?.items || []
          },
          certifications: {
            enabled: sections.certifications?.enabled !== false,
            order: sections.certifications?.order || 6,
            items: sections.certifications?.items || []
          }
        },
        socialLinks,
        theme: {
          primaryColor: theme.primaryColor || '#3B82F6',
          secondaryColor: theme.secondaryColor || '#1E40AF',
          accentColor: theme.accentColor || '#F59E0B',
          backgroundColor: theme.backgroundColor || '#FFFFFF',
          textColor: theme.textColor || '#1F2937',
          fontFamily: theme.fontFamily || 'Inter',
          fontSize: theme.fontSize || 'medium',
          layout: theme.layout || 'single-column'
        }
      })
    }

    await portfolio.save()

    console.log(`🎨 Portfolio ${portfolio.isNew ? 'created' : 'updated'} for user ${userId}`)

    res.json(
      Helpers.formatResponse(true, {
        portfolio: {
          id: portfolio._id,
          slug: portfolio.slug,
          template: portfolio.template,
          personalInfo: portfolio.personalInfo,
          sections: portfolio.sections,
          socialLinks: portfolio.socialLinks,
          theme: portfolio.theme,
          settings: portfolio.settings,
          version: portfolio.version,
          portfolioUrl: portfolio.portfolioUrl
        }
      }, `Portfolio ${portfolio.isNew ? 'created' : 'updated'} successfully`)
    )
  } catch (error) {
    console.error('Generate portfolio error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Validation error', errors)
      )
    }

    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error creating/updating portfolio', error.message)
    )
  }
}

// @desc    Get user's portfolio
// @route   GET /api/portfolio/:userId
const getPortfolio = async (req, res) => {
  try {
    const userId = req.params.userId

    // Validate user access (owner can access private portfolio)
    const isOwner = userId === req.user.id.toString()

    const portfolio = await Portfolio.findOne({ userId })
      .populate('userId', 'displayName email photoURL')

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found')
      )
    }

    // Check if portfolio is published or user is owner
    if (!portfolio.settings.published && !isOwner) {
      return res.status(403).json(
        Helpers.formatResponse(false, null, 'Portfolio is not published')
      )
    }

    res.json(
      Helpers.formatResponse(true, { portfolio }, 'Portfolio retrieved successfully')
    )
  } catch (error) {
    console.error('Get portfolio error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Update portfolio
// @route   PUT /api/portfolio/:portfolioId
const updatePortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params
    const userId = req.user.id
    const updateData = req.body

    const portfolio = await Portfolio.findOne({ 
      _id: portfolioId, 
      userId 
    })

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found')
      )
    }

    // Update fields
    const allowedFields = [
      'personalInfo', 'sections', 'socialLinks', 'theme', 
      'seo', 'settings', 'template'
    ]

    allowedFields.forEach(field => {
      if (updateData[field]) {
        if (field === 'personalInfo' || field === 'sections' || field === 'theme' || field === 'settings') {
          portfolio[field] = { ...portfolio[field], ...updateData[field] }
        } else {
          portfolio[field] = updateData[field]
        }
      }
    })

    // Increment version
    portfolio.version += 1

    await portfolio.save()

    console.log(`📝 Portfolio updated: ${portfolioId}`)

    res.json(
      Helpers.formatResponse(true, { portfolio }, 'Portfolio updated successfully')
    )
  } catch (error) {
    console.error('Update portfolio error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Validation error', errors)
      )
    }

    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error updating portfolio', error.message)
    )
  }
}

// @desc    Publish portfolio
// @route   POST /api/portfolio/:portfolioId/publish
const publishPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params
    const userId = req.user.id
    const { published = true, customSlug } = req.body

    const portfolio = await Portfolio.findOne({ 
      _id: portfolioId, 
      userId 
    })

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found')
      )
    }

    // Update slug if provided
    if (customSlug && customSlug !== portfolio.slug) {
      const slugExists = await Portfolio.findOne({ 
        slug: customSlug.toLowerCase(),
        _id: { $ne: portfolioId }
      })

      if (slugExists) {
        return res.status(400).json(
          Helpers.formatResponse(false, null, 'Custom URL already exists')
        )
      }

      portfolio.slug = customSlug.toLowerCase()
    }

    portfolio.settings.published = published
    await portfolio.save()

    console.log(`🌐 Portfolio ${published ? 'published' : 'unpublished'}: ${portfolioId}`)

    res.json(
      Helpers.formatResponse(true, {
        portfolio: {
          id: portfolio._id,
          published: portfolio.settings.published,
          slug: portfolio.slug,
          portfolioUrl: portfolio.portfolioUrl
        }
      }, `Portfolio ${published ? 'published' : 'unpublished'} successfully`)
    )
  } catch (error) {
    console.error('Publish portfolio error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error updating portfolio status', error.message)
    )
  }
}

// @desc    Get public portfolio by slug
// @route   GET /api/portfolio/public/:slug
const getPublicPortfolio = async (req, res) => {
  try {
    const { slug } = req.params

    const portfolio = await Portfolio.findOne({ 
      slug,
      'settings.published': true 
    }).populate('userId', 'displayName')

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found or not published')
      )
    }

    // Check if password protected
    if (portfolio.settings.passwordProtected) {
      const { password } = req.query
      
      if (!password || password !== portfolio.settings.password) {
        return res.status(401).json(
          Helpers.formatResponse(false, null, 'Password required')
        )
      }
    }

    // Increment views
    await portfolio.incrementViews(true)

    res.json(
      Helpers.formatResponse(true, { portfolio }, 'Portfolio retrieved successfully')
    )
  } catch (error) {
    console.error('Get public portfolio error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Upload portfolio image
// @route   POST /api/portfolio/:portfolioId/upload-image
const uploadPortfolioImage = async (req, res) => {
  try {
    const { portfolioId } = req.params
    const userId = req.user.id
    const { imageType = 'profile' } = req.body

    if (!req.file) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'No image uploaded')
      )
    }

    // Validate image
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    Helpers.validateFileUpload(req.file, allowedTypes, 5 * 1024 * 1024) // 5MB limit

    const portfolio = await Portfolio.findOne({ 
      _id: portfolioId, 
      userId 
    })

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found')
      )
    }

    // Upload to Firebase
    const imageURL = await uploadToFirebase(req.file, `portfolios/${userId}/images`)

    // Update portfolio based on image type
    if (imageType === 'profile') {
      portfolio.personalInfo.profileImage = imageURL
    }
    // Add other image types as needed

    await portfolio.save()

    res.json(
      Helpers.formatResponse(true, {
        imageURL,
        imageType
      }, 'Image uploaded successfully')
    )
  } catch (error) {
    console.error('Upload portfolio image error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error uploading image', error.message)
    )
  }
}

// @desc    Get portfolio analytics
// @route   GET /api/portfolio/:portfolioId/analytics
const getPortfolioAnalytics = async (req, res) => {
  try {
    const { portfolioId } = req.params
    const userId = req.user.id

    const portfolio = await Portfolio.findOne({ 
      _id: portfolioId, 
      userId 
    }).select('analytics settings slug')

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found')
      )
    }

    res.json(
      Helpers.formatResponse(true, {
        analytics: portfolio.analytics,
        published: portfolio.settings.published,
        portfolioUrl: portfolio.portfolioUrl
      }, 'Portfolio analytics retrieved successfully')
    )
  } catch (error) {
    console.error('Get portfolio analytics error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Delete portfolio
// @route   DELETE /api/portfolio/:portfolioId
const deletePortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params
    const userId = req.user.id

    const portfolio = await Portfolio.findOneAndDelete({ 
      _id: portfolioId, 
      userId 
    })

    if (!portfolio) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Portfolio not found')
      )
    }

    console.log(`🗑️ Portfolio deleted: ${portfolioId}`)

    res.json(
      Helpers.formatResponse(true, null, 'Portfolio deleted successfully')
    )
  } catch (error) {
    console.error('Delete portfolio error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error deleting portfolio', error.message)
    )
  }
}

module.exports = { 
  generatePortfolio, 
  getPortfolio, 
  updatePortfolio,
  publishPortfolio,
  getPublicPortfolio,
  uploadPortfolioImage,
  getPortfolioAnalytics,
  deletePortfolio
}
