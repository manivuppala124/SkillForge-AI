const User = require('../models/User')
const admin = require('../config/firebase-admin')
const Helpers = require('../utils/helpers')

// @desc    Register/Login user with Firebase
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'ID token is required')
      )
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const { uid, email, name, picture } = decodedToken

    if (!email) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Email is required')
      )
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUID: uid })

    if (!user) {
      // Create new user
      user = new User({
        firebaseUID: uid,
        email: email.toLowerCase().trim(),
        displayName: name || email.split('@')[0],
        photoURL: picture || null,
        lastLoginAt: new Date()
      })
      await user.save()

      // Log successful registration
      console.log(`✅ New user registered: ${email}`)
    } else {
      // Update last login
      user.lastLoginAt = new Date()
      await user.save()
    }

    res.status(200).json(
      Helpers.formatResponse(true, {
        user: {
          id: user._id,
          firebaseUID: user.firebaseUID,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          profile: user.profile,
          progress: user.progress,
          subscriptionStatus: user.subscriptionStatus
        }
      }, 'User authenticated successfully')
    )
  } catch (error) {
    console.error('Auth error:', error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json(
        Helpers.formatResponse(false, null, 'Token expired. Please login again.')
      )
    } else if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json(
        Helpers.formatResponse(false, null, 'Token revoked. Please login again.')
      )
    }

    res.status(401).json(
      Helpers.formatResponse(false, null, 'Invalid token', error.message)
    )
  }
}

// @desc    Login user (same as register for Firebase auth)
// @route   POST /api/auth/login
const login = async (req, res) => {
  await register(req, res)
}

// @desc    Get user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v')
    
    if (!user) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'User not found')
      )
    }

    res.json(
      Helpers.formatResponse(true, { user }, 'Profile retrieved successfully')
    )
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { profile, settings } = req.body
    
    // Validate input
    const updateData = {}
    if (profile) updateData.profile = profile
    if (settings) updateData.settings = settings

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    )

    if (!user) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'User not found')
      )
    }

    res.json(
      Helpers.formatResponse(true, { user }, 'Profile updated successfully')
    )
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Validation error', errors)
      )
    }

    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Delete user account
// @route   DELETE /api/auth/account
const deleteAccount = async (req, res) => {
  try {
    const { confirmPassword } = req.body
    
    if (confirmPassword !== 'DELETE') {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Please confirm account deletion by typing "DELETE"')
      )
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(req.user.id)

    // Delete user from Firebase
    try {
      await admin.auth().deleteUser(req.user.firebaseUID)
    } catch (firebaseError) {
      console.error('Firebase user deletion error:', firebaseError)
      // Continue even if Firebase deletion fails
    }

    res.json(
      Helpers.formatResponse(true, null, 'Account deleted successfully')
    )
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

// @desc    Get user statistics
// @route   GET /api/auth/stats
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress')
    
    if (!user) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'User not found')
      )
    }

    // Additional stats can be fetched from other collections
    const stats = {
      progress: user.progress,
      joinDate: user.createdAt,
      lastActivity: user.progress.lastActivity
    }

    res.json(
      Helpers.formatResponse(true, { stats }, 'User statistics retrieved successfully')
    )
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Server error', error.message)
    )
  }
}

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  deleteAccount, 
  getUserStats 
}
