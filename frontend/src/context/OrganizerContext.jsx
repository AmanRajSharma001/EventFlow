import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENT_REGISTRATIONS,
  INITIAL_ORGANIZER_ACTIVITY,
  INITIAL_ORGANIZER_EVENTS,
  INITIAL_ORGANIZER_NOTIFICATIONS,
} from '../data/mockOrganizerData';
import { OrganizerContext } from './organizerContextDef';
import eventsService from '../services/events.service';
import { isDatabasePendingError } from '../services/dbStatus';

const ORGANIZER_EVENTS_KEY = 'eventflow_organizer_events';
const ORGANIZER_REGISTRATIONS_KEY = 'eventflow_organizer_registrations';
const ORGANIZER_ANNOUNCEMENTS_KEY = 'eventflow_organizer_announcements';
const ORGANIZER_NOTIFICATIONS_KEY = 'eventflow_organizer_notifications';

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Graceful fallback for quota restrictions
  }
}

export function OrganizerProvider({ children }) {
  const [events, setEvents] = useState(() =>
    readStorage(ORGANIZER_EVENTS_KEY, INITIAL_ORGANIZER_EVENTS)
  );
  const [registrations, setRegistrations] = useState(() =>
    readStorage(ORGANIZER_REGISTRATIONS_KEY, INITIAL_EVENT_REGISTRATIONS)
  );
  const [announcements, setAnnouncements] = useState(() =>
    readStorage(ORGANIZER_ANNOUNCEMENTS_KEY, INITIAL_ANNOUNCEMENTS)
  );
  const [notifications, setNotifications] = useState(() =>
    readStorage(ORGANIZER_NOTIFICATIONS_KEY, INITIAL_ORGANIZER_NOTIFICATIONS)
  );
  const [activityItems, setActivityItems] = useState(INITIAL_ORGANIZER_ACTIVITY);

  useEffect(() => {
    writeStorage(ORGANIZER_EVENTS_KEY, events);
  }, [events]);

  useEffect(() => {
    writeStorage(ORGANIZER_REGISTRATIONS_KEY, registrations);
  }, [registrations]);

  useEffect(() => {
    writeStorage(ORGANIZER_ANNOUNCEMENTS_KEY, announcements);
  }, [announcements]);

  useEffect(() => {
    writeStorage(ORGANIZER_NOTIFICATIONS_KEY, notifications);
  }, [notifications]);

  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Sync organizer events from live backend if available
  const refreshEvents = useCallback(async () => {
    const token = localStorage.getItem('eventflow_token');
    if (!token) return;

    setIsLoadingEvents(true);
    try {
      const liveEvents = await eventsService.getOrganizerMyEvents();
      if (Array.isArray(liveEvents) && liveEvents.length > 0) {
        setEvents(liveEvents);
        setIsLiveSync(true);
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        // Known fallback: Keep local mock events
        setIsLiveSync(false);
      }
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    async function initSync() {
      const token = localStorage.getItem('eventflow_token');
      if (!token) return;
      try {
        const liveEvents = await eventsService.getOrganizerMyEvents();
        if (!isCancelled && Array.isArray(liveEvents) && liveEvents.length > 0) {
          setEvents(liveEvents);
          setIsLiveSync(true);
        }
      } catch (error) {
        if (!isCancelled && isDatabasePendingError(error)) {
          setIsLiveSync(false);
        }
      }
    }
    initSync();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Create a new event (Hybrid: tries backend API, falls back to local mock state)
  const createEvent = async (data, isPublish = true) => {
    // 1. Attempt live backend creation
    try {
      const created = await eventsService.createEvent(data);
      if (created) {
        let finalEvent = created;
        if (isPublish) {
          try {
            finalEvent = await eventsService.publishEvent(created.id);
          } catch {
            // Keep draft status if publish endpoint fails
          }
        }
        setEvents((prev) => [finalEvent, ...prev]);
        toast.success(
          isPublish
            ? `Event "${finalEvent.title}" published live!`
            : `Event "${finalEvent.title}" saved as draft live!`
        );
        return finalEvent;
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        // Fallback: Database is pending setup
        toast.success(
          isPublish
            ? `Event saved in preview mode (Database pending).`
            : `Draft saved in preview mode (Database pending).`
        );
      } else {
        const errorMsg =
          error?.response?.data?.message || 'Failed to create event. Please check required fields.';
        toast.error(errorMsg);
        return null;
      }
    }

    // 2. Preserved local mock event creation
    const newId = 'evt-' + Date.now().toString(36);
    const newEvent = {
      id: newId,
      ...data,
      attendeesCount: 0,
      status: isPublish ? 'PUBLISHED' : 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl:
        data.imageUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    };

    setEvents((prev) => [newEvent, ...prev]);

    setActivityItems((prev) => [
      {
        id: 'act-' + Date.now(),
        title: isPublish ? 'Event Published' : 'Draft Event Created',
        description: `"${newEvent.title}" saved in local preview state.`,
        timestamp: 'Just now',
        type: 'event',
      },
      ...prev,
    ]);

    return newEvent;
  };

  // Update an existing event (Hybrid)
  const updateEvent = async (id, updatedFields) => {
    // 1. Attempt live backend update
    try {
      const updated = await eventsService.updateEvent(id, updatedFields);
      if (updated) {
        setEvents((prev) =>
          prev.map((evt) => (evt.id === id ? { ...evt, ...updated } : evt))
        );
        toast.success(`Event details updated live on backend.`);
        return updated;
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        toast.success('Event details updated (local preview mode).');
      } else {
        const errorMsg = error?.response?.data?.message || 'Failed to update event.';
        toast.error(errorMsg);
        return null;
      }
    }

    // 2. Local mock update fallback
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, ...updatedFields } : evt))
    );

    setActivityItems((prev) => [
      {
        id: 'act-' + Date.now(),
        title: 'Event Updated',
        description: `Modifications saved for "${updatedFields.title || id}".`,
        timestamp: 'Just now',
        type: 'event',
      },
      ...prev,
    ]);

    return { id, ...updatedFields };
  };

  // Delete an event (Hybrid with active attendees protection)
  const deleteEvent = async (id) => {
    const toDelete = events.find((e) => e.id === id);

    // 1. Attempt live backend deletion
    try {
      await eventsService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
      setAnnouncements((prev) => prev.filter((a) => a.eventId !== id));
      toast.success(`Event "${toDelete?.title || id}" deleted permanently.`);
      return true;
    } catch (error) {
      const errorMsg = error?.response?.data?.message || '';
      if (
        error?.response?.status === 400 &&
        (errorMsg.toLowerCase().includes('attendee') || errorMsg.toLowerCase().includes('registration'))
      ) {
        toast.error('Cannot delete an event with active registrations. Please cancel the event instead.', {
          duration: 6000,
        });
        return false;
      } else if (isDatabasePendingError(error)) {
        // Local mock deletion fallback
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
        setAnnouncements((prev) => prev.filter((a) => a.eventId !== id));
        toast.success(`Event "${toDelete?.title || id}" removed from local preview.`);
        return true;
      } else {
        toast.error(errorMsg || 'Failed to delete event.');
        return false;
      }
    }
  };

  // Change event status (Publish, Cancel, Draft)
  const setEventStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'PUBLISHED') {
        const published = await eventsService.publishEvent(id);
        if (published) {
          setEvents((prev) =>
            prev.map((evt) => (evt.id === id ? { ...evt, status: 'PUBLISHED' } : evt))
          );
          toast.success(`Event published live!`);
          return;
        }
      } else if (newStatus === 'CANCELLED') {
        await eventsService.updateEvent(id, { status: 'CANCELLED' });
        setEvents((prev) =>
          prev.map((evt) => (evt.id === id ? { ...evt, status: 'CANCELLED' } : evt))
        );
        toast.success(`Event status changed to CANCELLED.`);
        return;
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        // Fallback to local state update below
      } else {
        const errorMsg = error?.response?.data?.message || `Failed to update event status to ${newStatus}.`;
        toast.error(errorMsg);
        return;
      }
    }

    // Local mock state status update
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, status: newStatus } : evt))
    );
    toast.success(`Event status changed to ${newStatus} (preview mode).`);
  };

  // Mark attendance for a student registration
  const markAttendance = (registrationId, status) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRegistrations((prev) =>
      prev.map((reg) => {
        if (reg.id === registrationId) {
          return {
            ...reg,
            attendanceStatus: status,
            checkInTime: status === 'Present' ? `Today · ${nowStr}` : null,
          };
        }
        return reg;
      })
    );

    const target = registrations.find((r) => r.id === registrationId);
    toast.success(`Attendance marked as ${status} for ${target?.studentName || 'Student'}.`);
  };

  // Add announcement
  const addAnnouncement = (data) => {
    const newAnn = {
      id: 'ann-' + Date.now(),
      ...data,
      publishedAt: 'Today · Just now',
      author: 'Faculty Organizer',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    setActivityItems((prev) => [
      {
        id: 'act-' + Date.now(),
        title: 'Announcement Published',
        description: `"${newAnn.title}" sent to event participants.`,
        timestamp: 'Just now',
        type: 'announcement',
      },
      ...prev,
    ]);

    toast.success('Announcement broadcasted to participants.');
    return newAnn;
  };

  // Delete announcement
  const deleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success('Announcement removed.');
  };

  // Notifications controls
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('Notification inbox cleared.');
  };

  return (
    <OrganizerContext.Provider
      value={{
        events,
        registrations,
        announcements,
        notifications,
        activityItems,
        isLiveSync,
        isLoadingEvents,
        refreshEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        setEventStatus,
        markAttendance,
        addAnnouncement,
        deleteAnnouncement,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
}
