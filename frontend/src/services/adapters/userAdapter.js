/**
 * User Data Shape Adapters.
 * Normalizes backend user payloads to match frontend UI models and vice versa.
 */

export const ROLE_MAP = Object.freeze({
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
});

export const REVERSE_ROLE_MAP = Object.freeze({
  student: 'STUDENT',
  organizer: 'ORGANIZER',
  admin: 'ADMIN',
});

/**
 * Normalizes backend user model for frontend consumption.
 * - Converts uppercase roles (STUDENT, ORGANIZER, ADMIN) to lowercase.
 * - Preserves all existing properties.
 * - Generates fallback avatar if missing.
 *
 * @param {object|null} backendUser - Raw user object from Express/Prisma
 * @returns {object|null} Frontend-compliant user object
 */
export function adaptUser(backendUser) {
  if (!backendUser || typeof backendUser !== 'object') return null;

  const rawRole = (backendUser.role || '').toUpperCase();
  const normalizedRole = ROLE_MAP[rawRole] || backendUser.role?.toLowerCase() || 'student';

  const avatar =
    backendUser.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      backendUser.name || 'User'
    )}`;

  return {
    ...backendUser,
    role: normalizedRole,
    avatar,
  };
}

/**
 * Prepares user registration payload for the backend POST /api/auth/register endpoint.
 * Backend strictly accepts: { name, email, password }.
 *
 * @param {object} frontendData - Form data from RegisterPage
 * @returns {{ name: string, email: string, password: string }}
 */
export function adaptRegisterPayload(frontendData) {
  return {
    name: (frontendData.fullName || frontendData.name || '').trim(),
    email: (frontendData.email || '').trim().toLowerCase(),
    password: frontendData.password,
  };
}

/**
 * Prepares user credentials for the backend POST /api/auth/login endpoint.
 * Backend strictly accepts: { email, password }.
 * If user entered a roll number or identifier without '@', normalizes to student college email.
 *
 * @param {object} credentials - Form data from LoginPage
 * @returns {{ email: string, password: string }}
 */
export function adaptLoginPayload(credentials) {
  const identifier = (credentials.identifier || credentials.email || '').trim();
  const email = identifier.includes('@')
    ? identifier.toLowerCase()
    : `${identifier.toLowerCase()}@college.edu`;

  return {
    email,
    password: credentials.password,
  };
}
