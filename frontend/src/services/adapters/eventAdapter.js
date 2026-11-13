/**
 * Event Data Shape Adapters.
 * Maps backend Event models (Prisma) to frontend UI components and vice versa.
 */

/**
 * Splits an ISO 8601 date string into date ('YYYY-MM-DD') and time ('HH:mm') strings.
 * @param {string|Date|null} isoString
 * @returns {{ date: string, time: string }}
 */
function splitIsoDateTime(isoString) {
  if (!isoString) return { date: '', time: '' };

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const date = d.toISOString().split('T')[0];
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return { date, time: `${hours}:${minutes}` };
  } catch {
    return { date: '', time: '' };
  }
}

/**
 * Combines date ('YYYY-MM-DD') and time ('HH:mm') into an ISO 8601 string.
 * @param {string} date
 * @param {string} time
 * @returns {string|null}
 */
function combineToIso(date, time = '00:00') {
  if (!date) return null;

  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = (time || '00:00').split(':').map(Number);

    const d = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

/**
 * Normalizes a backend Event object to match the frontend expectations.
 *
 * Mappings:
 * - backend `location` -> frontend `venue`
 * - backend `capacity` -> frontend `maxSeats`
 * - backend ISO `startDate` -> frontend `startDate` ('YYYY-MM-DD') and `startTime` ('HH:mm')
 * - backend ISO `endDate` -> frontend `endDate` ('YYYY-MM-DD') and `endTime` ('HH:mm')
 * - backend `_count.registrations` -> frontend `attendeesCount`
 *
 * @param {object|null} backendEvent - Event object from Express API
 * @returns {object|null} Frontend-compliant event object
 */
export function adaptEvent(backendEvent) {
  if (!backendEvent || typeof backendEvent !== 'object') return null;

  const startParsed = splitIsoDateTime(backendEvent.startDate);
  const endParsed = splitIsoDateTime(backendEvent.endDate);

  const attendeesCount =
    backendEvent._count?.registrations != null
      ? backendEvent._count.registrations
      : Number(backendEvent.attendeesCount) || 0;

  const maxSeats = Number(backendEvent.capacity) || Number(backendEvent.maxSeats) || 100;
  const venue = backendEvent.location || backendEvent.venue || 'Campus Auditorium';

  return {
    ...backendEvent,
    venue,
    location: venue, // Keep both for safety
    maxSeats,
    capacity: maxSeats,
    attendeesCount,
    startDate: startParsed.date || backendEvent.startDate,
    startTime: startParsed.time || '09:00',
    endDate: endParsed.date || backendEvent.endDate,
    endTime: endParsed.time || '17:00',
    rawStartDate: backendEvent.startDate,
    rawEndDate: backendEvent.endDate,
  };
}

/**
 * Adapts an array of backend events.
 * @param {Array} backendEvents
 * @returns {Array}
 */
export function adaptEventsList(backendEvents) {
  if (!Array.isArray(backendEvents)) return [];
  return backendEvents.map(adaptEvent).filter(Boolean);
}

/**
 * Prepares a frontend event form payload for backend POST /api/events or PATCH /api/events/:id.
 *
 * Mappings:
 * - frontend `venue` -> backend `location`
 * - frontend `maxSeats` -> backend `capacity` (integer)
 * - frontend `startDate` + `startTime` -> backend ISO `startDate`
 * - frontend `endDate` + `endTime` -> backend ISO `endDate`
 * - frontend `registrationDeadline` -> backend ISO `registrationDeadline`
 *
 * @param {object} frontendEvent
 * @returns {object} Backend-compliant event payload
 */
export function adaptEventPayload(frontendEvent) {
  const startDateIso = combineToIso(frontendEvent.startDate, frontendEvent.startTime);
  const endDateIso = frontendEvent.endDate
    ? combineToIso(frontendEvent.endDate, frontendEvent.endTime)
    : undefined;

  const regDeadlineIso = frontendEvent.registrationDeadline
    ? combineToIso(frontendEvent.registrationDeadline, '23:59')
    : undefined;

  const capacity = parseInt(frontendEvent.maxSeats ?? frontendEvent.capacity, 10) || 100;
  const location = (frontendEvent.venue || frontendEvent.location || '').trim();

  const payload = {
    title: (frontendEvent.title || '').trim(),
    description: (frontendEvent.description || '').trim(),
    category: (frontendEvent.category || 'General').trim(),
    location,
    capacity,
    startDate: startDateIso,
  };

  if (endDateIso) payload.endDate = endDateIso;
  if (regDeadlineIso) payload.registrationDeadline = regDeadlineIso;

  return payload;
}
