import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  INITIAL_ADMIN_ANNOUNCEMENTS,
  INITIAL_ADMIN_AUDIT_LOG,
  INITIAL_ALL_USERS,
} from '../data/mockAdminData';
import {
  INITIAL_EVENT_REGISTRATIONS,
  INITIAL_ORGANIZER_EVENTS,
} from '../data/mockOrganizerData';
import { AdminContext } from './adminContextDef';

const ADMIN_USERS_KEY = 'eventflow_admin_users';
const ADMIN_EVENTS_KEY = 'eventflow_organizer_events'; // Sync with organizer events!
const ADMIN_REGISTRATIONS_KEY = 'eventflow_organizer_registrations'; // Sync with registrations!
const ADMIN_ANNOUNCEMENTS_KEY = 'eventflow_admin_announcements';

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
    // Ignore quota errors
  }
}

export function AdminProvider({ children }) {
  const [users, setUsers] = useState(() =>
    readStorage(ADMIN_USERS_KEY, INITIAL_ALL_USERS)
  );
  const [events, setEvents] = useState(() =>
    readStorage(ADMIN_EVENTS_KEY, INITIAL_ORGANIZER_EVENTS)
  );
  const [registrations, setRegistrations] = useState(() =>
    readStorage(ADMIN_REGISTRATIONS_KEY, INITIAL_EVENT_REGISTRATIONS)
  );
  const [announcements, setAnnouncements] = useState(() =>
    readStorage(ADMIN_ANNOUNCEMENTS_KEY, INITIAL_ADMIN_ANNOUNCEMENTS)
  );
  const [auditLog, setAuditLog] = useState(INITIAL_ADMIN_AUDIT_LOG);

  useEffect(() => {
    writeStorage(ADMIN_USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    writeStorage(ADMIN_EVENTS_KEY, events);
  }, [events]);

  useEffect(() => {
    writeStorage(ADMIN_REGISTRATIONS_KEY, registrations);
  }, [registrations]);

  useEffect(() => {
    writeStorage(ADMIN_ANNOUNCEMENTS_KEY, announcements);
  }, [announcements]);

  // Update a user's status (Active, Suspended, Pending)
  const updateUserStatus = (userId, newStatus) => {
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );

    setAuditLog((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: `User Status Updated: ${newStatus}`,
        description: `${targetUser?.name || userId} is now ${newStatus}.`,
        timestamp: 'Just now',
        category: 'user',
      },
      ...prev,
    ]);

    toast.success(`User "${targetUser?.name || 'Account'}" marked as ${newStatus}.`);
  };

  // Update event status (PUBLISHED, DRAFT, COMPLETED, CANCELLED)
  const updateEventStatus = (eventId, newStatus) => {
    const targetEvent = events.find((e) => e.id === eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
    );

    setAuditLog((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: `Event Status: ${newStatus}`,
        description: `"${targetEvent?.title || eventId}" changed to ${newStatus}.`,
        timestamp: 'Just now',
        category: 'event',
      },
      ...prev,
    ]);

    toast.success(`Event status updated to ${newStatus}.`);
  };

  // Delete an event from platform
  const deleteEvent = (eventId) => {
    const target = events.find((e) => e.id === eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));

    setAuditLog((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: 'Event Deleted by Admin',
        description: `"${target?.title || eventId}" was removed.`,
        timestamp: 'Just now',
        category: 'event',
      },
      ...prev,
    ]);

    toast.success(`Event "${target?.title || 'Event'}" deleted.`);
  };

  // Create an announcement
  const createAnnouncement = (annData) => {
    const newAnn = {
      id: 'adm-ann-' + Date.now().toString(36),
      publishedAt: 'Today · Just now',
      ...annData,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    setAuditLog((prev) => [
      {
        id: 'aud-' + Date.now(),
        title: 'New Announcement Published',
        description: `"${newAnn.title}" broadcasted.`,
        timestamp: 'Just now',
        category: 'announcement',
      },
      ...prev,
    ]);

    toast.success('Announcement broadcasted across campus.');
    return newAnn;
  };

  // Update an announcement
  const updateAnnouncement = (id, updatedFields) => {
    setAnnouncements((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...updatedFields } : ann))
    );
    toast.success('Announcement updated.');
  };

  // Delete an announcement
  const deleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    toast.success('Announcement removed.');
  };

  // Reset to initial demo records
  const resetToDemo = () => {
    setUsers(INITIAL_ALL_USERS);
    setEvents(INITIAL_ORGANIZER_EVENTS);
    setRegistrations(INITIAL_EVENT_REGISTRATIONS);
    setAnnouncements(INITIAL_ADMIN_ANNOUNCEMENTS);
    toast.success('Admin platform state reset to initial demo defaults.');
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        events,
        registrations,
        announcements,
        auditLog,
        updateUserStatus,
        updateEventStatus,
        deleteEvent,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        resetToDemo,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
