import api from './api';
import {
  adaptRegistration,
  adaptRegistrationsList,
} from './adapters/registrationAdapter';

/**
 * Event Registration API Service.
 * Interfaces with Express endpoints at /api/events/:id/register and /api/registrations/*.
 */
export const registrationsService = {
  /**
   * Register the authenticated student for an event.
   * Endpoint: POST /api/events/:id/register
   * @param {string} eventId
   * @param {object} details - Optional { department, semester, notes }
   * @returns {Promise<object>}
   */
  async registerForEvent(eventId, details = {}) {
    const response = await api.post(`/events/${eventId}/register`, details);
    return adaptRegistration(response.data?.data?.registration || response.data?.data);
  },

  /**
   * Fetch all event registrations for the authenticated student.
   * Endpoint: GET /api/registrations/my
   * @returns {Promise<Array>}
   */
  async getMyRegistrations() {
    const response = await api.get('/registrations/my');
    return adaptRegistrationsList(response.data?.data?.registrations || []);
  },

  /**
   * Fetch registration list for a specific event (Organizer/Admin).
   * Endpoint: GET /api/events/:id/registrations
   * @param {string} eventId
   * @returns {Promise<Array>}
   */
  async getEventRegistrations(eventId) {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data?.data?.registrations || [];
  },

  /**
   * Cancel an existing event registration.
   * Endpoint: PATCH /api/registrations/:id/cancel
   * @param {string} registrationId
   * @param {string} reason
   * @returns {Promise<object>}
   */
  async cancelRegistration(registrationId, reason = 'Student voluntary cancellation') {
    const response = await api.patch(`/registrations/${registrationId}/cancel`, { reason });
    return adaptRegistration(response.data?.data?.registration || response.data);
  },

  /**
   * Fetch cryptographic QR token for a ticket pass.
   * Endpoint: GET /api/registrations/:id/qr
   * @param {string} registrationId
   * @returns {Promise<{ qrToken: string }>}
   */
  async getRegistrationQrToken(registrationId) {
    const response = await api.get(`/registrations/${registrationId}/qr`);
    return response.data?.data || { qrToken: '' };
  },
};

export default registrationsService;
