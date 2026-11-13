import api from './api';

/**
 * Organizer Dashboard API Service.
 * Interfaces with Express endpoints at /api/organizer/*.
 */
export const organizerService = {
  /**
   * Fetch aggregated analytics, metrics, and activity for organizer dashboard.
   * Endpoint: GET /api/organizer/dashboard
   * Requires ORGANIZER or ADMIN role.
   * @returns {Promise<object>}
   */
  async getOrganizerDashboard() {
    const response = await api.get('/organizer/dashboard');
    return response.data?.data || {};
  },
};

export default organizerService;
