import api from './api';

/**
 * Attendance & Check-in API Service.
 * Interfaces with Express endpoints at /api/attendance/* and /api/events/:id/attendance.
 */
export const attendanceService = {
  /**
   * Verify attendee pass using scanned cryptographic QR token.
   * Endpoint: POST /api/attendance/check-in
   * @param {string} qrToken
   * @param {string} eventId
   * @returns {Promise<object>}
   */
  async checkInWithQr(qrToken, eventId) {
    const response = await api.post('/attendance/check-in', { qrToken, eventId });
    return response.data?.data || response.data;
  },

  /**
   * Manually check in an attendee by registration ID.
   * Endpoint: POST /api/attendance/manual
   * @param {string} registrationId
   * @param {string} notes
   * @returns {Promise<object>}
   */
  async manualCheckIn(registrationId, notes = '') {
    const response = await api.post('/attendance/manual', { registrationId, notes });
    return response.data?.data || response.data;
  },

  /**
   * Fetch authenticated student's verified attendance records.
   * Endpoint: GET /api/attendance/my
   * @returns {Promise<Array>}
   */
  async getMyAttendance() {
    const response = await api.get('/attendance/my');
    return response.data?.data?.attendance || [];
  },

  /**
   * Fetch attendance roster and check-in summary for an event (Organizer/Admin).
   * Endpoint: GET /api/events/:id/attendance
   * @param {string} eventId
   * @returns {Promise<object>}
   */
  async getEventAttendance(eventId) {
    const response = await api.get(`/events/${eventId}/attendance`);
    return response.data?.data || {};
  },
};

export default attendanceService;
