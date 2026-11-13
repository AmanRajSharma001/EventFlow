/**
 * Database Dependency Detection Utility for EventFlow.
 *
 * The Express backend (Teammate 1) returns HTTP 503 with a specific payload
 * when Prisma/PostgreSQL (Teammate 3) is pending integration:
 * {
 *   "success": false,
 *   "message": "... awaiting database integration with Sagar's Prisma setup.",
 *   "dependency": {
 *     "status": "pending_database_integration",
 *     "teammate": "Sagar",
 *     "required": "..."
 *   }
 * }
 *
 * This utility strictly identifies ONLY this known dependency state.
 * Any other HTTP 503, 500, or network error is preserved and propagated.
 */

export const PENDING_DB_STATUS = 'pending_database_integration';

/**
 * Checks whether an Axios error corresponds to the known pending database state.
 * @param {unknown} error - Axios or unknown error object
 * @returns {boolean} True only if error matches pending database integration
 */
export function isDatabasePendingError(error) {
  if (!error || typeof error !== 'object') return false;

  const response = error.response;
  if (!response || response.status !== 503) return false;

  const dependency = response.data?.dependency;
  return Boolean(
    dependency &&
    typeof dependency === 'object' &&
    dependency.status === PENDING_DB_STATUS
  );
}

/**
 * Extracts dependency metadata from a pending database error.
 * @param {unknown} error - Axios error object
 * @returns {{ isPending: boolean, teammate: string|null, required: string|null, message: string|null }}
 */
export function getPendingDependencyInfo(error) {
  if (!isDatabasePendingError(error)) {
    return {
      isPending: false,
      teammate: null,
      required: null,
      message: null,
    };
  }

  const data = error.response?.data;
  return {
    isPending: true,
    teammate: data?.dependency?.teammate || 'Sagar',
    required: data?.dependency?.required || 'PostgreSQL database connection and Prisma schema',
    message: data?.message || 'Awaiting database integration',
  };
}
