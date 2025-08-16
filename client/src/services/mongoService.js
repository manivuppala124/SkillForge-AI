import axios from 'axios';

const MONGO_API_BASE = import.meta.env.VITE_MONGO_API_BASE_URL || 'http://localhost:5000/mongo';

export const mongoService = {
  getUserData: (userId) => axios.get(`${MONGO_API_BASE}/user/${userId}`),
  saveUserData: (userId, data) => axios.post(`${MONGO_API_BASE}/user/${userId}`, data),
};
