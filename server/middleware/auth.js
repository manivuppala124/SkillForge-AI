// const admin = require('../config/firebase-admin')
// const User = require('../models/User')

// const auth = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.header('Authorization')
    
//     if (!authHeader) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Access denied. No token provided.' 
//       })
//     }

//     // Extract token from "Bearer TOKEN"
//     const token = authHeader.replace('Bearer ', '')
    
//     if (!token) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Access denied. Invalid token format.' 
//       })
//     }

//     try {
//       // Verify Firebase ID token
//       const decodedToken = await admin.auth().verifyIdToken(token)
      
//       // Find user in MongoDB
//       const user = await User.findOne({ firebaseUID: decodedToken.uid })
      
//       if (!user) {
//         return res.status(401).json({ 
//           success: false,
//           message: 'User not found. Please register first.' 
//         })
//       }

//       if (!user.isActive) {
//         return res.status(401).json({ 
//           success: false,
//           message: 'Account is disabled. Please contact support.' 
//         })
//       }

//       // Add user info to request object
//       req.user = {
//         id: user._id,
//         firebaseUID: user.firebaseUID,
//         email: user.email,
//         displayName: user.displayName,
//         photoURL: user.photoURL,
//         subscriptionStatus: user.subscriptionStatus
//       }

//       // Add Firebase token claims
//       req.firebase = {
//         uid: decodedToken.uid,
//         email: decodedToken.email,
//         email_verified: decodedToken.email_verified,
//         auth_time: decodedToken.auth_time,
//         iss: decodedToken.iss,
//         aud: decodedToken.aud,
//         exp: decodedToken.exp,
//         iat: decodedToken.iat
//       }

//       next()
//     } catch (firebaseError) {
//       console.error('Firebase token verification error:', firebaseError)
      
//       let message = 'Invalid token'
      
//       if (firebaseError.code === 'auth/id-token-expired') {
//         message = 'Token expired. Please login again.'
//       } else if (firebaseError.code === 'auth/id-token-revoked') {
//         message = 'Token revoked. Please login again.'
//       } else if (firebaseError.code === 'auth/invalid-id-token') {
//         message = 'Invalid token format.'
//       } else if (firebaseError.code === 'auth/user-disabled') {
//         message = 'User account has been disabled.'
//       } else if (firebaseError.code === 'auth/user-not-found') {
//         message = 'User account not found.'
//       }

//       return res.status(401).json({ 
//         success: false,
//         message,
//         code: firebaseError.code
//       })
//     }
//   } catch (error) {
//     console.error('Auth middleware error:', error)
//     return res.status(500).json({ 
//       success: false,
//       message: 'Authentication service error' 
//     })
//   }
// }

// // Optional auth middleware - doesn't fail if no token
// const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.header('Authorization')
    
//     if (!authHeader) {
//       return next() // Continue without authentication
//     }

//     const token = authHeader.replace('Bearer ', '')
    
//     if (!token) {
//       return next() // Continue without authentication
//     }

//     try {
//       const decodedToken = await admin.auth().verifyIdToken(token)
//       const user = await User.findOne({ firebaseUID: decodedToken.uid })
      
//       if (user && user.isActive) {
//         req.user = {
//           id: user._id,
//           firebaseUID: user.firebaseUID,
//           email: user.email,
//           displayName: user.displayName,
//           photoURL: user.photoURL,
//           subscriptionStatus: user.subscriptionStatus
//         }
//         req.firebase = {
//           uid: decodedToken.uid,
//           email: decodedToken.email,
//           email_verified: decodedToken.email_verified
//         }
//       }
//     } catch (firebaseError) {
//       // Continue without authentication if token is invalid
//       console.warn('Optional auth failed:', firebaseError.message)
//     }

//     next()
//   } catch (error) {
//     console.error('Optional auth middleware error:', error)
//     next() // Continue without authentication
//   }
// }

// // Admin role check middleware
// const requireAdmin = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       success: false,
//       message: 'Authentication required' 
//     })
//   }

//   // Check if user has admin role (you can implement role-based access)
//   if (req.user.subscriptionStatus !== 'enterprise') {
//     return res.status(403).json({ 
//       success: false,
//       message: 'Admin access required' 
//     })
//   }

//   next()
// }

// // Premium subscription check middleware
// const requirePremium = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ 
//       success: false,
//       message: 'Authentication required' 
//     })
//   }

//   const allowedSubscriptions = ['premium', 'enterprise']
//   if (!allowedSubscriptions.includes(req.user.subscriptionStatus)) {
//     return res.status(403).json({ 
//       success: false,
//       message: 'Premium subscription required' 
//     })
//   }

//   next()
// }

// // Rate limiting by user
// const createUserRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
//   const requests = new Map()
  
//   return (req, res, next) => {
//     if (!req.user) {
//       return next() // Skip rate limiting for unauthenticated users
//     }

//     const userId = req.user.id.toString()
//     const now = Date.now()
    
//     // Clean old entries
//     for (const [uid, data] of requests.entries()) {
//       if (now - data.resetTime > windowMs) {
//         requests.delete(uid)
//       }
//     }
    
//     // Check current user requests
//     const userRequests = requests.get(userId)
    
//     if (!userRequests) {
//       requests.set(userId, { count: 1, resetTime: now })
//       return next()
//     }
    
//     if (userRequests.count >= maxRequests) {
//       return res.status(429).json({
//         success: false,
//         message: 'Too many requests. Please try again later.',
//         retryAfter: Math.ceil((windowMs - (now - userRequests.resetTime)) / 1000)
//       })
//     }
    
//     userRequests.count++
//     next()
//   }
// }

// module.exports = { 
//   auth, 
//   optionalAuth, 
//   requireAdmin, 
//   requirePremium, 
//   createUserRateLimit 
// }
const admin = require('../config/firebase-admin');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware started');
    
    // Get token from header
    const authHeader = req.header('Authorization') || req.headers.authorization;
    
    console.log('📋 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Extract token from "Bearer TOKEN"
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.log('❌ Invalid token format');
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Invalid token format.',
        code: 'INVALID_FORMAT'
      });
    }

    try {
      console.log('🔍 Verifying Firebase token...');
      
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      console.log('✅ Token verified for user:', decodedToken.uid);
      
      // Find or create user in MongoDB
      let user = await User.findOne({ firebaseUID: decodedToken.uid });
      
      if (!user) {
        console.log('👤 Creating new user in database...');
        
        // Create new user if doesn't exist
        user = new User({
          firebaseUID: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name || decodedToken.email.split('@')[0],
          photoURL: decodedToken.picture || null,
          subscriptionStatus: 'free',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await user.save();
        console.log('✅ New user created:', user._id);
      }

      if (!user.isActive) {
        console.log('❌ User account is disabled');
        return res.status(401).json({ 
          success: false,
          message: 'Account is disabled. Please contact support.',
          code: 'ACCOUNT_DISABLED'
        });
      }

      // Add user info to request object
      req.user = {
        id: user._id,
        firebaseUID: user.firebaseUID,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscriptionStatus: user.subscriptionStatus
      };

      // Add Firebase token claims
      req.firebase = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified || false,
        auth_time: decodedToken.auth_time,
        exp: decodedToken.exp,
        iat: decodedToken.iat
      };

      console.log('✅ Auth successful for user:', user.email);
      next();
      
    } catch (firebaseError) {
      console.error('❌ Firebase token verification error:', firebaseError.message);
      
      let message = 'Invalid token';
      let code = 'INVALID_TOKEN';
      
      if (firebaseError.code === 'auth/id-token-expired') {
        message = 'Token expired. Please login again.';
        code = 'TOKEN_EXPIRED';
      } else if (firebaseError.code === 'auth/id-token-revoked') {
        message = 'Token revoked. Please login again.';
        code = 'TOKEN_REVOKED';
      } else if (firebaseError.code === 'auth/invalid-id-token') {
        message = 'Invalid token format.';
        code = 'INVALID_TOKEN';
      } else if (firebaseError.code === 'auth/user-disabled') {
        message = 'User account has been disabled.';
        code = 'USER_DISABLED';
      } else if (firebaseError.code === 'auth/user-not-found') {
        message = 'User account not found.';
        code = 'USER_NOT_FOUND';
      }

      return res.status(401).json({ 
        success: false,
        message,
        code,
        error: firebaseError.code
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || req.headers.authorization;
    
    if (!authHeader) {
      console.log('ℹ️ Optional auth: No token provided');
      return next(); // Continue without authentication
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.log('ℹ️ Optional auth: Invalid token format');
      return next(); // Continue without authentication
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUID: decodedToken.uid });
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          firebaseUID: user.firebaseUID,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          subscriptionStatus: user.subscriptionStatus
        };
        req.firebase = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          email_verified: decodedToken.email_verified
        };
        console.log('✅ Optional auth successful for:', user.email);
      }
    } catch (firebaseError) {
      // Continue without authentication if token is invalid
      console.warn('⚠️ Optional auth failed:', firebaseError.message);
    }

    next();
  } catch (error) {
    console.error('❌ Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

// Rate limiting by user
const createUserRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      console.log('ℹ️ Rate limiting skipped - no authenticated user');
      return next(); // Skip rate limiting for unauthenticated users
    }

    const userId = req.user.id.toString();
    const now = Date.now();
    
    // Clean old entries
    for (const [uid, data] of requests.entries()) {
      if (now - data.resetTime > windowMs) {
        requests.delete(uid);
      }
    }
    
    // Check current user requests
    const userRequests = requests.get(userId);
    
    if (!userRequests) {
      requests.set(userId, { count: 1, resetTime: now });
      console.log(`⏰ Rate limit: User ${req.user.email} - 1/${maxRequests} requests`);
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      const retryAfter = Math.ceil((windowMs - (now - userRequests.resetTime)) / 1000);
      console.log(`❌ Rate limit exceeded for user: ${req.user.email}`);
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfter,
        limit: maxRequests,
        windowMs: windowMs
      });
    }
    
    userRequests.count++;
    console.log(`⏰ Rate limit: User ${req.user.email} - ${userRequests.count}/${maxRequests} requests`);
    next();
  };
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  // Check if user has admin role (you can implement role-based access)
  if (req.user.subscriptionStatus !== 'enterprise') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }

  next();
};

// Premium subscription check middleware
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  const allowedSubscriptions = ['premium', 'enterprise'];
  if (!allowedSubscriptions.includes(req.user.subscriptionStatus)) {
    return res.status(403).json({ 
      success: false,
      message: 'Premium subscription required' 
    });
  }

  next();
};

module.exports = { 
  auth, 
  optionalAuth, 
  requireAdmin, 
  requirePremium, 
  createUserRateLimit  // ✅ This was missing!
};
