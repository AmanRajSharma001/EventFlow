import axios from 'axios';

/**
 * Centralized Axios instance for EventFlow.
 * Configured with base URL from environment variables.
 * Ready for future backend API integration with Aman.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('eventflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Requests can proceed when browser storage is unavailable.
    }

    return config;
  }
);

export default api;
