// import axios from 'axios';

// const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// const axiosInstance = axios.create({
//   baseURL: API_BASE,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// export const resumeAPI = {
//   upload: (formData) =>
//     axiosInstance.post('/resume/upload', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     }),
//   analyze: (data) => axiosInstance.post('/resume/analyze', data)
// };

// export const quizAPI = {
//   generate: (topic, difficulty, numQuestions = 5) =>
//     axiosInstance.post('/quiz/generate', {
//       topic,
//       difficulty,
//       num_questions: numQuestions
//     }),
//   submit: (quizId, answers) =>
//     axiosInstance.post('/quiz/submit', { quizId, answers })
// };

// export const learningAPI = {
//   generate: (goal, timeline, currentSkills, learning_style = 'mixed', hours = 8) =>
//     axiosInstance.post('/learning/generate-path', {
//       goal,
//       timeline: parseInt(timeline, 10),
//       current_skills: currentSkills,
//       learning_style,
//       hours_per_week: hours
//     }),
//   updateProgress: (pathId, moduleId) =>
//     axiosInstance.post('/learning/progress', {
//       pathId,
//       moduleId,
//       action: 'complete_module'
//     })
// };

// export const tutorAPI = {
//   ask: (question, context, subject) =>
//     axiosInstance.post('/tutor/ask', { question, context, subject })
// };
import axios from 'axios';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to get current user token
const getCurrentUserToken = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh token
          resolve(token);
        } catch (error) {
          console.error('Error getting token:', error);
          reject(error);
        }
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getCurrentUserToken();
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Added auth token to request');
    } catch (error) {
      console.warn('⚠️ No auth token available:', error.message);
      // Continue with request without token (let server decide if auth required)
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed - redirecting to login');
      // Clear any cached auth state
      localStorage.removeItem('firebase-auth');
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const resumeAPI = {
  upload: (formData) => {
    console.log('📄 Uploading resume...');
    return axiosInstance.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  analyze: (data) => {
    console.log('🔍 Analyzing resume...');
    return axiosInstance.post('/resume/analyze', data);
  }
};

export const quizAPI = {
  generate: (topic, difficulty, numQuestions = 5) => {
    console.log(`🎯 Generating ${difficulty} quiz on ${topic}...`);
    return axiosInstance.post('/quiz/generate', {
      topic,
      difficulty,
      num_questions: numQuestions
    });
  },
  submit: (quizId, answers) => {
    console.log('📝 Submitting quiz answers...');
    return axiosInstance.post('/quiz/submit', { quizId, answers });
  }
};

export const learningAPI = {
  generate: (goal, timeline, currentSkills, learning_style = 'mixed', hours = 8) => {
    console.log(`🎓 Generating learning path for ${goal}...`);
    return axiosInstance.post('/learning/generate-path', {
      goal,
      timeline: parseInt(timeline, 10),
      current_skills: Array.isArray(currentSkills) ? currentSkills : currentSkills.split(',').map(s => s.trim()),
      learning_style,
      hours_per_week: hours
    });
  },
  updateProgress: (pathId, moduleId) => {
    console.log('📈 Updating learning progress...');
    return axiosInstance.post('/learning/progress', {
      pathId,
      moduleId,
      action: 'complete_module'
    });
  }
};

export const tutorAPI = {
  ask: (question, context, subject) => {
    console.log('🤖 Asking AI tutor...');
    return axiosInstance.post('/tutor/ask', { question, context, subject });
  }
};

// Health check endpoint
export const healthAPI = {
  check: () => {
    console.log('🏥 Checking server health...');
    return axiosInstance.get('/health');
  }
};
