function formatCheckInTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function adaptStudentAttendance(record) {
  if (!record || typeof record !== 'object') return null;

  const event = record.event || {};
  const attendanceId = record.attendanceId || record.id;
  if (!attendanceId || !record.registrationId || !event.id) return null;

  return {
    ...record,
    id: attendanceId,
    attendanceId,
    registrationId: record.registrationId,
    eventId: event.id,
    event,
    status: 'Present',
    checkInTime: formatCheckInTime(record.checkedInAt || record.checkInTime),
    checkInLocation: event.venue || event.location || 'Event checkpoint',
    verificationMethod: 'QR Code Scan',
    pointsEarned: null,
  };
}

export function adaptStudentAttendanceList(records) {
  if (!Array.isArray(records)) return [];
  return records.map(adaptStudentAttendance).filter(Boolean);
}

export function adaptEventAttendanceRoster(registrations, attendees = []) {
  const checkedInByRegistration = new Map(
    attendees.map((attendee) => [attendee.registrationId, attendee])
  );

  return (Array.isArray(registrations) ? registrations : []).map((registration) => {
    const student = registration.student || {};
    const attendee = checkedInByRegistration.get(registration.id);

    return {
      ...registration,
      id: registration.id || registration.registrationId,
      registrationId: registration.id || registration.registrationId,
      eventId: registration.eventId,
      studentName: registration.studentName || student.name || 'Student',
      email: registration.email || student.email || '',
      rollNumber: registration.rollNumber || student.rollNumber || '',
      department: registration.department || student.department || '',
      semester: registration.semester || student.semester || '',
      status: String(registration.status || '').toUpperCase() === 'CANCELLED'
        ? 'Cancelled'
        : 'Confirmed',
      attendanceStatus: attendee ? 'Present' : 'Pending',
      checkInTime: attendee?.checkedInAt
        ? formatCheckInTime(attendee.checkedInAt)
        : null,
    };
  });
}
