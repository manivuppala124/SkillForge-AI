// ===== server/config/firebase-admin.js =====

const admin = require('firebase-admin')

// Initialize Firebase Admin SDK from environment variables
if (!admin.apps.length) {
  try {
    // Build service account object from env vars
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
    }

    // Determine bucket name
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET
      || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName
    })

    console.log('✅ Firebase Admin initialized with bucket:', bucketName)
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message)
    process.exit(1)
  }
}

module.exports = admin
