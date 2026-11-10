const EVENT_STATUS_VARIANTS = {
  'Past event': 'neutral',
  'Registration closed': 'neutral',
  'Filling fast': 'amber',
  'Registration open': 'success',
};

export function isPastEvent(event) {
  if (event.status === 'Completed') return true;

  if (!event.startDate) return Boolean(event.isPast);

  const eventDay = new Date(event.startDate);
  const today = new Date();
  eventDay.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return eventDay < today;
}

export function getEventCapacity(event) {
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
  const { maxSeats, seatsLeft, percentFilled } = getEventCapacity(event);

  if (isPastEvent(event)) return 'Past event';
  if (event.status === 'Closed' || (maxSeats > 0 && seatsLeft === 0)) {
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
