import api from './api';
import { isDatabasePendingError, getPendingDependencyInfo } from './dbStatus';

/**
 * System Health & Connectivity Inspection Service.
 * Safely determines backend availability and database readiness.
 */
export const systemService = {
  /**
   * Ping Express health endpoint.
   * Endpoint: GET /api/health
   * Verifies server process availability only (not database).
   * @returns {Promise<{ isOnline: boolean, data?: object }>}
   */
  async pingHealth() {
    try {
      const response = await api.get('/health', { timeout: 3000 });
      return {
        isOnline: response.status === 200,
        data: response.data,
      };
    } catch (err) {
      return {
        isOnline: false,
        error: err.message,
      };
    }
  },

  /**
   * Empirically checks backend server and database readiness.
   * - Probes /api/health for server status.
   * - Probes a read-only endpoint (/api/events) to inspect database readiness.
   *
   * Possible status outcomes:
   * - 'server_offline': Backend server is unreachable.
   * - 'db_pending': Express is running, but database/Prisma is pending (HTTP 503).
   * - 'ready': Express server and PostgreSQL/Prisma are both fully operational (HTTP 200).
   * - 'error': Unexpected server error occurred.
   *
   * @returns {Promise<{ status: string, serverOnline: boolean, dbReady: boolean, dependencyInfo: object|null }>}
   */
  async checkIntegrationStatus() {
    const health = await this.pingHealth();

    if (!health.isOnline) {
      return {
        status: 'server_offline',
        serverOnline: false,
        dbReady: false,
        dependencyInfo: null,
      };
    }

    try {
      // Safe read-only probe to check database connectivity
      const response = await api.get('/events', { params: { limit: 1 }, timeout: 3000 });
      if (response.status === 200) {
        return {
          status: 'ready',
          serverOnline: true,
          dbReady: true,
          dependencyInfo: null,
        };
      }
      return {
        status: 'unknown',
        serverOnline: true,
        dbReady: false,
        dependencyInfo: null,
      };
    } catch (err) {
      if (isDatabasePendingError(err)) {
        return {
          status: 'db_pending',
          serverOnline: true,
          dbReady: false,
          dependencyInfo: getPendingDependencyInfo(err),
        };
      }

      return {
        status: 'error',
        serverOnline: true,
        dbReady: false,
        dependencyInfo: null,
        error: err.message,
      };
    }
  },
};

export default systemService;
