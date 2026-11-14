/**
 * Registration Data Shape Adapters.
 * Normalizes backend registration records for student portal views.
 */

function getStatusLabel(status) {
  return String(status || '').toUpperCase() === 'CANCELLED'
    ? 'Cancelled'
    : 'Confirmed';
}

export function adaptRegistration(backendRegistration) {
  if (!backendRegistration || typeof backendRegistration !== 'object') return null;

  const event = backendRegistration.event || {};
  const registrationId = backendRegistration.id || backendRegistration.registrationId;

  if (!registrationId || !backendRegistration.eventId) return null;

  return {
    ...backendRegistration,
    id: registrationId,
    registrationId,
    eventId: backendRegistration.eventId,
    statusLabel: getStatusLabel(backendRegistration.status),
    isCancelled: String(backendRegistration.status || '').toUpperCase() === 'CANCELLED',
    event: {
      ...event,
      id: event.id || backendRegistration.eventId,
      title: event.title || 'Event',
      venue: event.venue || event.location || 'Venue to be announced',
      location: event.location || event.venue || 'Venue to be announced',
    },
  };
}

export function adaptRegistrationsList(backendRegistrations) {
  if (!Array.isArray(backendRegistrations)) return [];
  return backendRegistrations.map(adaptRegistration).filter(Boolean);
}
