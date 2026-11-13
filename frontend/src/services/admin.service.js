import api from './api';

/**
 * Superadmin API Service.
 * Interfaces with Express endpoints at /api/admin/*.
 */
export const adminService = {
  /**
   * Fetch university-wide telemetry, KPIs, and system metrics.
   * Endpoint: GET /api/admin/dashboard
   * Requires ADMIN role.
   * @returns {Promise<object>}
   */
  async getAdminDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data?.data || {};
  },

  /**
   * NOTE: User management endpoints (GET /api/admin/users, PATCH /api/admin/users/:id/status)
   * and campus-wide broadcast endpoints are pending implementation by Teammate 1.
   * Stubs are defined below for future activation.
   */
};

export default adminService;
