// import React, { createContext, useState, useEffect } from 'react';
// import {
//   getAuth,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithPopup,
//   signInWithPhoneNumber,
//   GoogleAuthProvider,
//   RecaptchaVerifier,
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth';
// import app from '../firebase/config';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const auth = getAuth(app);
//   const googleProvider = new GoogleAuthProvider();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, [auth]);

//   const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
//   const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
//   const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

//   // OTP phone login
//   const setupRecaptcha = (phoneNumber) => {
//     const verifier = new RecaptchaVerifier(
//       'recaptcha-container',
//       { size: 'invisible' },
//       auth
//     );
//     return signInWithPhoneNumber(auth, phoneNumber, verifier);
//   };

//   const logout = () => signOut(auth);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         login,
//         signup,
//         loginWithGoogle,
//         setupRecaptcha,
//         logout,
//         loading
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export { AuthContext };
import React, { createContext, useState, useEffect } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import app from '../firebase/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    console.log('🔥 Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      setUser(firebaseUser);
      setLoading(false);
      setAuthError(null);
    });
    return unsubscribe;
  }, [auth]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting email/password login...');
      setAuthError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      console.log('📝 Attempting user registration...');
      setAuthError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registration successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Registration error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔍 Attempting Google login...');
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google login successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Google login error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const setupRecaptcha = async (phoneNumber) => {
    try {
      console.log('📱 Setting up phone auth...');
      setAuthError(null);
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          'recaptcha-container',
          { size: 'invisible', callback: () => console.log('✅ reCAPTCHA solved') },
          auth
        );
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      console.log('✅ OTP sent to:', phoneNumber);
      return confirmationResult;
    } catch (error) {
      console.error('❌ Phone auth error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      login,
      signup,
      loginWithGoogle,
      setupRecaptcha,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
