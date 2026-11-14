/**
 * Initial organizer events list with full status lifecycle support:
 * 'PUBLISHED' | 'DRAFT' | 'COMPLETED' | 'CANCELLED'
 */
export const INITIAL_ORGANIZER_EVENTS = [
  {
    id: 'evt-hackathon-2026',
    title: 'Hackathon 2026: 36-Hour National Code Sprint',
    category: 'Technical',
    department: 'Department of Computer Science & Engineering',
    date: 'Nov 28 – 29, 2026',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    time: '09:00 AM – 09:00 PM',
    startTime: '09:00',
    endTime: '21:00',
    venue: 'Computing Hub, Block 4',
    location: 'Campus Block 4, 3rd Floor Labs',
    organizer: 'Turing Computing Society',
    coordinator: 'Dr. R. K. Mukherjee',
    attendeesCount: 285,
    maxSeats: 300,
    status: 'PUBLISHED',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    description: 'Flagship 36-hour code sprint focusing on Generative AI, Campus Automation, and Decentralized Networks.',
    registrationDeadline: '2026-11-25',
    tags: ['Hackathon', 'AI & ML', 'Coding'],
    createdAt: '2026-10-10',
  },
  {
    id: 'evt-ai-ml-workshop',
    title: 'Hands-on AI & ML Workshop: Transformers to Production',
    category: 'Workshops',
    department: 'Department of Information Technology & AI Lab',
    date: 'Dec 05, 2026',
    startDate: '2026-12-05',
    endDate: '2026-12-05',
    time: '10:00 AM – 04:00 PM',
    startTime: '10:00',
    endTime: '16:00',
    venue: 'Seminar Hall 2, Science Complex',
    location: 'Science Complex, Ground Floor',
    organizer: 'IEEE Student Branch',
    coordinator: 'Er. A. K. Varma',
    attendeesCount: 85,
    maxSeats: 120,
    status: 'PUBLISHED',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    description: 'A practical lab-based workshop on fine-tuning open-source vision and language models using PyTorch.',
    registrationDeadline: '2026-12-01',
    tags: ['Machine Learning', 'PyTorch', 'AI'],
    createdAt: '2026-10-18',
  },
  {
    id: 'evt-devops-bootcamp',
    title: 'DevOps & Cloud Infrastructure Bootcamp',
    category: 'Workshops',
    department: 'Department of Information Technology',
    date: 'Oct 15, 2026',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    time: '10:00 AM – 05:00 PM',
    startTime: '10:00',
    endTime: '17:00',
    venue: 'Computing Lab 3, IT Block',
    location: 'IT Block, 2nd Floor',
    organizer: 'Open Source Developer Group',
    coordinator: 'Dr. Vivek Saxena',
    attendeesCount: 80,
    maxSeats: 80,
    status: 'COMPLETED',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    description: 'Hands-on session on Linux containerization, GitHub Actions CI/CD pipelines, and cloud deployment practices.',
    registrationDeadline: '2026-10-12',
    tags: ['Docker', 'DevOps', 'Cloud'],
    createdAt: '2026-09-20',
  },
  {
    id: 'evt-tech-expo-draft',
    title: 'Annual Campus Innovation Expo 2027',
    category: 'Competitions',
    department: 'Department of Computer Science & Engineering',
    date: 'Jan 15 – 16, 2027',
    startDate: '2027-01-15',
    endDate: '2027-01-16',
    time: '09:00 AM – 05:00 PM',
    startTime: '09:00',
    endTime: '17:00',
    venue: 'Main Exhibition Hall & Central Courtyard',
    location: 'Administrative Block North',
    organizer: 'Turing Computing Society',
    coordinator: 'Faculty Organizer',
    attendeesCount: 0,
    maxSeats: 400,
    status: 'DRAFT',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    description: 'Inter-departmental capstone project showcase with industry judging panels and incubation grants.',
    registrationDeadline: '2027-01-10',
    tags: ['Innovation', 'Projects', 'Expo'],
    createdAt: '2026-11-05',
  },
  {
    id: 'evt-quantum-seminar-cancelled',
    title: 'Guest Lecture: Introduction to Quantum Algorithms',
    category: 'Technical',
    department: 'Department of Computer Science & Engineering',
    date: 'Nov 08, 2026',
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    time: '02:00 PM – 04:30 PM',
    startTime: '14:00',
    endTime: '16:30',
    venue: 'Auditorium 3',
    location: 'Academic Block 1',
    organizer: 'Turing Computing Society',
    coordinator: 'Faculty Organizer',
    attendeesCount: 42,
    maxSeats: 100,
    status: 'CANCELLED',
    price: 'Free',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    description: 'Special guest keynote session postponed due to speaker travel scheduling conflict.',
    registrationDeadline: '2026-11-06',
    tags: ['Quantum', 'Algorithms'],
    createdAt: '2026-10-25',
  },
];

/**
 * Authentic mock student registrations across organizer events.
 */
export const INITIAL_EVENT_REGISTRATIONS = [
  {
    id: 'reg-001',
    eventId: 'evt-hackathon-2026',
    studentName: 'Aman Sharma',
    rollNumber: 'CS-2023-042',
    email: 'aman.sharma@college.edu',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    registeredAt: 'Nov 12, 2026 · 10:14 AM',
    status: 'Confirmed',
    attendanceStatus: 'Present',
    checkInTime: 'Nov 28, 2026 · 08:45 AM',
  },
  {
    id: 'reg-002',
    eventId: 'evt-hackathon-2026',
    studentName: 'Priya Patel',
    rollNumber: 'IT-2023-018',
    email: 'priya.patel@college.edu',
    department: 'Information Technology',
    semester: '5th Semester',
    registeredAt: 'Nov 12, 2026 · 11:30 AM',
    status: 'Confirmed',
    attendanceStatus: 'Present',
    checkInTime: 'Nov 28, 2026 · 08:52 AM',
  },
  {
    id: 'reg-003',
    eventId: 'evt-hackathon-2026',
    studentName: 'Rohan Mehta',
    rollNumber: 'CS-2023-095',
    email: 'rohan.mehta@college.edu',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    registeredAt: 'Nov 13, 2026 · 02:15 PM',
    status: 'Confirmed',
    attendanceStatus: 'Pending',
    checkInTime: null,
  },
  {
    id: 'reg-004',
    eventId: 'evt-hackathon-2026',
    studentName: 'Ananya Iyer',
    rollNumber: 'EC-2023-033',
    email: 'ananya.iyer@college.edu',
    department: 'Electronics & Communication',
    semester: '5th Semester',
    registeredAt: 'Nov 14, 2026 · 09:05 AM',
    status: 'Confirmed',
    attendanceStatus: 'Present',
    checkInTime: 'Nov 28, 2026 · 09:10 AM',
  },
  {
    id: 'reg-005',
    eventId: 'evt-hackathon-2026',
    studentName: 'Aryan Verma',
    rollNumber: 'CS-2024-112',
    email: 'aryan.verma@college.edu',
    department: 'Computer Science & Engineering',
    semester: '3rd Semester',
    registeredAt: 'Nov 14, 2026 · 04:45 PM',
    status: 'Cancelled',
    attendanceStatus: 'Absent',
    checkInTime: null,
  },
  {
    id: 'reg-006',
    eventId: 'evt-hackathon-2026',
    studentName: 'Neha Gupta',
    rollNumber: 'IT-2023-067',
    email: 'neha.gupta@college.edu',
    department: 'Information Technology',
    semester: '5th Semester',
    registeredAt: 'Nov 15, 2026 · 01:20 PM',
    status: 'Confirmed',
    attendanceStatus: 'Pending',
    checkInTime: null,
  },
  {
    id: 'reg-007',
    eventId: 'evt-ai-ml-workshop',
    studentName: 'Kavya Reddy',
    rollNumber: 'CS-2022-014',
    email: 'kavya.reddy@college.edu',
    department: 'Computer Science & Engineering',
    semester: '7th Semester',
    registeredAt: 'Nov 10, 2026 · 11:00 AM',
    status: 'Confirmed',
    attendanceStatus: 'Pending',
    checkInTime: null,
  },
  {
    id: 'reg-008',
    eventId: 'evt-ai-ml-workshop',
    studentName: 'Vikram Singh',
    rollNumber: 'IT-2023-054',
    email: 'vikram.singh@college.edu',
    department: 'Information Technology',
    semester: '5th Semester',
    registeredAt: 'Nov 11, 2026 · 03:25 PM',
    status: 'Confirmed',
    attendanceStatus: 'Pending',
    checkInTime: null,
  },
  {
    id: 'reg-009',
    eventId: 'evt-ai-ml-workshop',
    studentName: 'Sneha Nair',
    rollNumber: 'CS-2023-078',
    email: 'sneha.nair@college.edu',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    registeredAt: 'Nov 12, 2026 · 09:40 AM',
    status: 'Confirmed',
    attendanceStatus: 'Pending',
    checkInTime: null,
  },
  {
    id: 'reg-010',
    eventId: 'evt-devops-bootcamp',
    studentName: 'Devansh Joshi',
    rollNumber: 'IT-2022-088',
    email: 'devansh.joshi@college.edu',
    department: 'Information Technology',
    semester: '7th Semester',
    registeredAt: 'Oct 08, 2026 · 10:30 AM',
    status: 'Confirmed',
    attendanceStatus: 'Present',
    checkInTime: 'Oct 15, 2026 · 09:45 AM',
  },
  {
    id: 'reg-011',
    eventId: 'evt-devops-bootcamp',
    studentName: 'Aman Sharma',
    rollNumber: 'CS-2023-042',
    email: 'aman.sharma@college.edu',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    registeredAt: 'Oct 09, 2026 · 04:10 PM',
    status: 'Confirmed',
    attendanceStatus: 'Present',
    checkInTime: 'Oct 15, 2026 · 09:50 AM',
  },
];

/**
 * Mock announcements per event.
 */
export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-01',
    eventId: 'evt-hackathon-2026',
    title: 'Lab Allocation and 24/7 Power Backup Confirmed',
    message: 'All participants will be seated in Block 4, 3rd Floor Labs 301–304. High-speed LAN cables and overnight access passes will be distributed at 08:30 AM.',
    priority: 'Important',
    pinned: true,
    publishedAt: 'Nov 15, 2026 · 02:00 PM',
    author: 'Faculty Organizer',
  },
  {
    id: 'ann-02',
    eventId: 'evt-hackathon-2026',
    title: 'Problem Statements & Track Mentors Announced',
    message: 'The four challenge problem statements covering Generative AI, Smart Campus, Green Tech, and Web3 are now live on the event portal. Mentors will be available from 11:00 AM.',
    priority: 'Normal',
    pinned: false,
    publishedAt: 'Nov 14, 2026 · 11:30 AM',
    author: 'Dr. R. K. Mukherjee',
  },
  {
    id: 'ann-03',
    eventId: 'evt-ai-ml-workshop',
    title: 'Prerequisite Environment Setup Instructions',
    message: 'Please ensure PyTorch 2.4 and Jupyter Lab are pre-installed on your personal laptops before arriving at Seminar Hall 2. Cloud GPU instances will be provided.',
    priority: 'Urgent',
    pinned: true,
    publishedAt: 'Nov 12, 2026 · 04:15 PM',
    author: 'Faculty Organizer',
  },
];

/**
 * Mock organizer activity log.
 */
export const INITIAL_ORGANIZER_ACTIVITY = [
  {
    id: 'org-act-1',
    title: 'New Student Registration',
    description: 'Aman Sharma registered for Hackathon 2026 (Seat #285)',
    timestamp: '15m ago',
    type: 'registration',
  },
  {
    id: 'org-act-2',
    title: 'Announcement Broadcasted',
    description: 'Lab Allocation & Wi-Fi guidelines published to 285 participants',
    timestamp: '2h ago',
    type: 'announcement',
  },
  {
    id: 'org-act-3',
    title: 'Draft Event Saved',
    description: 'Campus Innovation Expo 2027 saved as Draft',
    timestamp: '1d ago',
    type: 'event',
  },
  {
    id: 'org-act-4',
    title: 'Attendance Check-in Completed',
    description: '80 participants verified for DevOps & Cloud Bootcamp',
    timestamp: 'Oct 15, 2026',
    type: 'attendance',
  },
];

/**
 * Mock organizer notifications.
 */
export const INITIAL_ORGANIZER_NOTIFICATIONS = [
  {
    id: 'org-notif-1',
    title: 'Capacity Alert: Hackathon 2026',
    message: 'Event is 95% full (285 of 300 seats taken). Consider expanding capacity or closing registrations.',
    time: '20m ago',
    read: false,
    type: 'alert',
  },
  {
    id: 'org-notif-2',
    title: 'Room Booking Approved',
    message: 'Computing Hub Block 4 reservation confirmed by Dean Student Welfare for Nov 28–29.',
    time: '3h ago',
    read: false,
    type: 'success',
  },
  {
    id: 'org-notif-3',
    title: 'New Feedback Received',
    message: 'DevOps Bootcamp received an average attendee satisfaction score of 4.9/5.0.',
    time: '2d ago',
    read: true,
    type: 'feedback',
  },
];

/**
 * Dynamic calculation helper for organizer overview stats.
 */
export function calculateOrganizerStats(events = INITIAL_ORGANIZER_EVENTS, registrations = INITIAL_EVENT_REGISTRATIONS) {
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;
  const draftEvents = events.filter((e) => e.status === 'DRAFT').length;
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length;
  const cancelledEvents = events.filter((e) => e.status === 'CANCELLED').length;

  const totalRegistrations = registrations.filter((r) => r.status === 'Confirmed').length;
  
  // Upcoming events
  const now = new Date('2026-11-13');
  const upcomingEvents = events.filter(
    (e) => e.status === 'PUBLISHED' && (!e.startDate || new Date(e.startDate) >= now)
  ).length;

  // Attendance metrics across completed records
  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
  const totalEligibleAttendance = registrations.filter((r) => r.status === 'Confirmed').length;
  const attendanceRate = totalEligibleAttendance > 0
    ? Math.round((attendedCount / totalEligibleAttendance) * 100)
    : 0;

  return {
    totalEvents,
    publishedEvents,
    draftEvents,
    completedEvents,
    cancelledEvents,
    totalRegistrations,
    upcomingEvents,
    attendedCount,
    attendanceRate,
  };
}

/**
 * Chart data helper for category distribution.
 */
export function getCategoryDistribution(events = INITIAL_ORGANIZER_EVENTS) {
  const counts = {};
  events.forEach((e) => {
    counts[e.category] = (counts[e.category] || 0) + 1;
  });

  return Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / events.length) * 100),
  }));
}
