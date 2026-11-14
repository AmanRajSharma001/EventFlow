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
 * Backend accepts: { name, email, password, rollNumber, department, semester, phone }.
 *
 * @param {object} frontendData - Form data from RegisterPage
 * @returns {{ name: string, email: string, password: string, rollNumber?: string, department?: string, semester?: string, phone?: string }}
 */
export function adaptRegisterPayload(frontendData) {
  const payload = {
    name: (frontendData.fullName || frontendData.name || '').trim(),
    email: (frontendData.email || '').trim().toLowerCase(),
    password: frontendData.password,
  };

  if (frontendData.rollNumber) payload.rollNumber = frontendData.rollNumber.trim().toUpperCase();
  if (frontendData.department) payload.department = frontendData.department.trim();
  if (frontendData.semester) payload.semester = frontendData.semester.trim();
  if (frontendData.phone) payload.phone = frontendData.phone.trim();

  return payload;
}

/**
 * Prepares user credentials for the backend POST /api/auth/login endpoint.
 * Backend accepts: { email, password } or { identifier, password } or { rollNumber, password }.
 * Supports logging in with institutional email or university roll number (URN).
 *
 * @param {object} credentials - Form data from LoginPage
 * @returns {{ identifier: string, password: string, email?: string, rollNumber?: string }}
 */
export function adaptLoginPayload(credentials) {
  const identifier = (credentials.identifier || credentials.email || credentials.rollNumber || '').trim();

  const payload = {
    password: credentials.password,
  };

  if (identifier.includes('@')) {
    payload.email = identifier.toLowerCase();
    payload.identifier = identifier.toLowerCase();
  } else {
    payload.identifier = identifier;
    payload.rollNumber = identifier.toUpperCase();
  }

  return payload;
}
