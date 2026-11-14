import api from './api';
import { adaptLoginPayload, adaptRegisterPayload, adaptUser } from './adapters/userAdapter';

/**
 * Authentication API Service.
 * Interfaces with Express endpoints at /api/auth/*.
 */
export const authService = {
  /**
   * Register a new user account.
   * Endpoint: POST /api/auth/register
   * @param {object} userData
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register(userData) {
    const payload = adaptRegisterPayload(userData);
    const response = await api.post('/auth/register', payload);
    const rawData = response.data?.data || {};

    return {
      user: adaptUser(rawData.user),
      token: rawData.token,
    };
  },

  /**
   * Authenticate an existing user.
   * Endpoint: POST /api/auth/login
   * @param {object} credentials - { identifier or email, password }
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(credentials) {
    const payload = adaptLoginPayload(credentials);
    const response = await api.post('/auth/login', payload);
    const rawData = response.data?.data || {};

    return {
      user: adaptUser(rawData.user),
      token: rawData.token,
    };
  },

  /**
   * Fetch current authenticated user's profile.
   * Endpoint: GET /api/auth/me
   * Requires Bearer token header (handled by Axios interceptor).
   * @returns {Promise<object>}
   */
  async getMe() {
    const response = await api.get('/auth/me');
    const rawUser = response.data?.data?.user;
    return adaptUser(rawUser);
  },
};

export default authService;
