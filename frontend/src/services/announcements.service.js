import api from './api';

/**
 * Announcement API Service.
 * Interfaces with Express endpoints at /api/events/:id/announcements and /api/announcements/:id.
 */
export const announcementsService = {
  /**
   * Fetch announcements published for a specific event.
   * Endpoint: GET /api/events/:id/announcements
   * @param {string} eventId
   * @returns {Promise<Array>}
   */
  async getEventAnnouncements(eventId) {
    const response = await api.get(`/events/${eventId}/announcements`);
    return response.data?.data?.announcements || [];
  },

  /**
   * Dispatch a new announcement for an event (Organizer/Admin).
   * Endpoint: POST /api/events/:id/announcements
   * @param {string} eventId
   * @param {object} payload - { title, message, priority, isPinned }
   * @returns {Promise<object>}
   */
  async createEventAnnouncement(eventId, payload) {
    const response = await api.post(`/events/${eventId}/announcements`, payload);
    return response.data?.data?.announcement || response.data;
  },

  /**
   * Delete an announcement.
   * Endpoint: DELETE /api/announcements/:id
   * @param {string} announcementId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteAnnouncement(announcementId) {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
  },
};

export default announcementsService;
