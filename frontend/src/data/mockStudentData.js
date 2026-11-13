import { mockCollegeEvents } from './mockEvents';

/**
 * Mock attendance records for past and current events.
 * Linked strictly to mockCollegeEvents.
 */
export const INITIAL_ATTENDANCE_RECORDS = [
  {
    id: 'att-01',
    eventId: 'evt-photo-competition',
    status: 'Present',
    checkInTime: 'Oct 28, 2026 · 01:45 PM',
    checkInLocation: 'Gate A Scanner, Fine Arts Wing',
    verificationMethod: 'QR Code Scan',
    pointsEarned: 15,
  },
  {
    id: 'att-02',
    eventId: 'evt-devops-bootcamp',
    status: 'Present',
    checkInTime: 'Oct 15, 2026 · 09:50 AM',
    checkInLocation: 'Terminal 14, IT Block Lab 3',
    verificationMethod: 'Faculty Roll Call',
    pointsEarned: 25,
  },
  {
    id: 'att-03',
    eventId: 'evt-freshers-welcome',
    status: 'Present',
    checkInTime: 'Sept 22, 2026 · 04:30 PM',
    checkInLocation: 'Main Amphitheatre Gate 2',
    verificationMethod: 'RFID Smart Card',
    pointsEarned: 10,
  },
];

/**
 * Initial activity timeline items for the student.
 */
export const INITIAL_ACTIVITY_ITEMS = [
  {
    id: 'act-01',
    type: 'registration',
    title: 'Registered for Hackathon 2026',
    description: '36-Hour National Code Sprint entry confirmed. Team seats reserved.',
    timestamp: '2 hours ago',
    eventId: 'evt-hackathon-2026',
  },
  {
    id: 'act-02',
    type: 'ticket',
    title: 'E-Ticket generated for AI & ML Workshop',
    description: 'Registration pass with security QR #EF-2026-3195 is ready.',
    timestamp: 'Yesterday at 04:15 PM',
    eventId: 'evt-ai-ml-workshop',
  },
  {
    id: 'act-03',
    type: 'attendance',
    title: 'Attendance verified: Chroma Lens Contest',
    description: 'Check-in confirmed by Aperture Photography Guild. +15 points earned.',
    timestamp: 'Oct 28, 2026',
    eventId: 'evt-photo-competition',
  },
  {
    id: 'act-04',
    type: 'attendance',
    title: 'Attendance verified: DevOps Bootcamp',
    description: 'Lab attendance marked by Prof. Vivek Saxena. +25 points earned.',
    timestamp: 'Oct 15, 2026',
    eventId: 'evt-devops-bootcamp',
  },
];

/**
 * Initial student notifications.
 */
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'Hackathon 2026 lab allocation',
    message: 'Computing Hub Block 4 lab stations and mentor schedules are now published.',
    time: '25m ago',
    read: false,
    category: 'announcement',
    link: '/events/evt-hackathon-2026',
  },
  {
    id: 'notif-02',
    title: 'AI & ML Workshop prerequisite',
    message: 'Please ensure PyTorch and Jupyter notebook are installed before the Dec 05 session.',
    time: '2h ago',
    read: false,
    category: 'reminder',
    link: '/events/evt-ai-ml-workshop',
  },
  {
    id: 'notif-03',
    title: 'Certificate available for download',
    message: 'Your certificate of participation for Chroma Lens Photography Contest is ready.',
    time: '3d ago',
    read: true,
    category: 'certificate',
    link: '/student/attendance',
  },
];

/**
 * Calculate dynamic statistics based on active registered event IDs and attendance records.
 */
export function calculateStudentStats(registeredEventIds = [], cancelledEventIds = [], attendanceRecords = INITIAL_ATTENDANCE_RECORDS) {
  const registeredEvents = mockCollegeEvents.filter(
    (event) => registeredEventIds.includes(event.id) && !cancelledEventIds.includes(event.id)
  );

  const upcomingRegistered = registeredEvents.filter((event) => !event.isPast && event.status !== 'Completed');
  const pastAttended = attendanceRecords.filter((rec) => rec.status === 'Present');
  
  // Total events the student was signed up for in the past
  const totalPastRegistered = attendanceRecords.length;
  const attendanceRate = totalPastRegistered > 0
    ? Math.round((pastAttended.length / totalPastRegistered) * 100)
    : 100;

  return {
    totalRegistered: registeredEvents.length + attendanceRecords.length,
    upcomingCount: upcomingRegistered.length,
    attendedCount: pastAttended.length,
    attendanceRate: Math.min(100, attendanceRate),
    totalPoints: pastAttended.reduce((sum, item) => sum + (item.pointsEarned || 0), 0),
  };
}

/**
 * Generates a mock ticket object for a registered event.
 */
export function generateTicketData(event, user) {
  if (!event) return null;
  
  const hashSeed = `${event.id}-${user?.rollNumber || 'DEMO'}`.toUpperCase();
  const regId = `EF-2026-${Math.abs(hashSeed.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0) % 9000 + 1000)}`;

  return {
    ticketNumber: regId,
    eventId: event.id,
    eventTitle: event.title,
    eventCategory: event.category,
    date: event.date,
    time: event.time,
    venue: event.venue,
    organizer: event.organizer,
    studentName: user?.name || 'Demo Student',
    rollNumber: user?.rollNumber || 'DEMO-001',
    department: user?.department || 'Computer Science & Engineering',
    semester: user?.semester || '6th Semester',
    email: user?.email || 'student@example.com',
    qrPayload: `EVENTFLOW-VALIDATE:${regId}:${event.id}:${user?.rollNumber || 'DEMO-001'}`,
    issuedAt: 'Nov 10, 2026 · Verified Preview Ticket',
    gate: event.venue?.includes('Block') ? 'Gate 4 North' : 'Main Entrance',
    status: 'Confirmed',
  };
}
