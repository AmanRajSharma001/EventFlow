import api from './api';
import { adaptEvent, adaptEventPayload, adaptEventsList } from './adapters/eventAdapter';

/**
 * Event Management API Service.
 * Interfaces with Express endpoints at /api/events/*.
 */
export const eventsService = {
  /**
   * Browse and filter campus events.
   * Endpoint: GET /api/events
   * Query params: { search, category, status, page, limit, mine }
   * @param {object} params
   * @returns {Promise<{ events: Array, pagination: object }>}
   */
  async getEvents(params = {}) {
    const response = await api.get('/events', { params });
    const rawData = response.data?.data || {};

    return {
      events: adaptEventsList(rawData.events || []),
      pagination: rawData.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  /**
   * Fetch specific event by unique ID.
   * Endpoint: GET /api/events/:id
   * @param {string} eventId
   * @returns {Promise<object>}
   */
  async getEventById(eventId) {
    const response = await api.get(`/events/${eventId}`);
    const rawEvent = response.data?.data?.event;
    return adaptEvent(rawEvent);
  },

  /**
   * Create a new campus event (Organizer/Admin).
   * Endpoint: POST /api/events
   * @param {object} eventData - Frontend event structure
   * @returns {Promise<object>}
   */
  async createEvent(eventData) {
    const payload = adaptEventPayload(eventData);
    const response = await api.post('/events', payload);
    const created = response.data?.data?.event;
    return adaptEvent(created);
  },

  /**
   * Update existing event details.
   * Endpoint: PATCH /api/events/:id
   * @param {string} eventId
   * @param {object} eventData
   * @returns {Promise<object>}
   */
  async updateEvent(eventId, eventData) {
    const payload = adaptEventPayload(eventData);
    const response = await api.patch(`/events/${eventId}`, payload);
    const updated = response.data?.data?.event;
    return adaptEvent(updated);
  },

  /**
   * Delete an event (Only allowed if no confirmed attendees exist).
   * Endpoint: DELETE /api/events/:id
   * @param {string} eventId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteEvent(eventId) {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Publish a draft event.
   * Endpoint: PATCH /api/events/:id/publish
   * @param {string} eventId
   * @returns {Promise<object>}
   */
  async publishEvent(eventId) {
    const response = await api.patch(`/events/${eventId}/publish`);
    const published = response.data?.data?.event;
    return adaptEvent(published);
  },

  /**
   * Fetch events belonging to the current organizer.
   * Endpoint: GET /api/events/organizer/my
   * @returns {Promise<Array>}
   */
  async getOrganizerMyEvents() {
    const response = await api.get('/events/organizer/my');
    const rawEvents = response.data?.data?.events || [];
    return adaptEventsList(rawEvents);
  },

  /**
   * Fetch event statistics summary.
   * Endpoint: GET /api/events/:id/stats
   * @param {string} eventId
   * @returns {Promise<object>}
   */
  async getEventStats(eventId) {
    const response = await api.get(`/events/${eventId}/stats`);
    return response.data?.data || {};
  },

  /**
   * Fetch detailed event statistics for organizers.
   * Endpoint: GET /api/events/:id/statistics
   * @param {string} eventId
   * @returns {Promise<object>}
   */
  async getEventDetailedStatistics(eventId) {
    const response = await api.get(`/events/${eventId}/statistics`);
    return response.data?.data || {};
  },
};

export default eventsService;
