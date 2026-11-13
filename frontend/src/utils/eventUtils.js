import { mockCollegeEvents } from '../data/mockEvents';

const EVENT_STATUS_VARIANTS = {
  'Past event': 'neutral',
  'Registration closed': 'neutral',
  'Filling fast': 'amber',
  'Registration open': 'success',
};

export function isPastEvent(event) {
  if (!event) return false;
  const normalizedStatus = String(event.status || '').toUpperCase();
  if (normalizedStatus === 'COMPLETED') return true;

  if (!event.startDate) return Boolean(event.isPast);

  const eventDay = new Date(event.startDate);
  const today = new Date();
  eventDay.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return eventDay < today;
}

export function getEventCapacity(event) {
  if (!event) return { maxSeats: 0, attendeesCount: 0, seatsLeft: 0, percentFilled: 0 };
  const maxSeats = Math.max(0, Number(event.maxSeats) || 0);
  const attendees = Math.max(0, Number(event.attendeesCount) || 0);
  const attendeesCount = maxSeats ? Math.min(attendees, maxSeats) : attendees;
  const seatsLeft = Math.max(0, maxSeats - attendees);
  const percentFilled = maxSeats
    ? Math.min(100, Math.round((attendeesCount / maxSeats) * 100))
    : 0;

  return { maxSeats, attendeesCount, seatsLeft, percentFilled };
}

export function getEventStatus(event) {
  if (!event) return 'Registration closed';
  const { maxSeats, seatsLeft, percentFilled } = getEventCapacity(event);

  if (isPastEvent(event)) return 'Past event';
  const normalizedStatus = String(event.status || '').toUpperCase();
  if (
    ['CLOSED', 'CANCELLED', 'COMPLETED'].includes(normalizedStatus) ||
    (maxSeats > 0 && seatsLeft === 0)
  ) {
    return 'Registration closed';
  }
  if (event.status === 'Filling Fast' || percentFilled >= 85) {
    return 'Filling fast';
  }

  return 'Registration open';
}

export function getEventStatusVariant(status) {
  return EVENT_STATUS_VARIANTS[status] || 'neutral';
}

export function matchesEventQuery(event, query) {
  if (!event) return false;
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = [
    event.title,
    event.organizer,
    event.venue,
    event.department,
    event.description,
    ...(event.tags || []),
  ].join(' ').toLowerCase();

  return searchableText.includes(normalizedQuery);
}

/**
 * Returns the fallback event catalog, combining static mock events
 * with any published events created by organizers in localStorage.
 */
export function getFallbackCatalogEvents() {
  try {
    const rawSaved = typeof window !== 'undefined' ? localStorage.getItem('eventflow_organizer_events') : null;
    if (!rawSaved) return mockCollegeEvents;
    const saved = JSON.parse(rawSaved);
    if (!Array.isArray(saved)) return mockCollegeEvents;
    const published = saved.filter((e) => e.status === 'PUBLISHED');
    const existingIds = new Set(mockCollegeEvents.map((e) => e.id));
    const uniqueSaved = published.filter((e) => !existingIds.has(e.id));
    return [...mockCollegeEvents, ...uniqueSaved];
  } catch {
    return mockCollegeEvents;
  }
}

