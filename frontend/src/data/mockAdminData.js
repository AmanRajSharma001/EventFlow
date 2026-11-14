/**
 * Unified Central User Directory for EventFlow Admin Portal.
 * Cross-references mockStudentData, mockOrganizerData, and mockEvents.
 */
export const INITIAL_ALL_USERS = [
  // --- STUDENTS ---
  {
    id: 'usr-std-001',
    name: 'Aman Sharma',
    email: 'aman.sharma@college.edu',
    role: 'student',
    rollNumber: 'CS-2023-042',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    status: 'Active',
    registeredEventsCount: 4,
    attendedCount: 3,
    joinedDate: '2025-08-15',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11001',
  },
  {
    id: 'usr-std-002',
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    role: 'student',
    rollNumber: 'IT-2023-018',
    department: 'Information Technology',
    semester: '5th Semester',
    status: 'Active',
    registeredEventsCount: 3,
    attendedCount: 2,
    joinedDate: '2025-08-16',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11002',
  },
  {
    id: 'usr-std-003',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@college.edu',
    role: 'student',
    rollNumber: 'CS-2023-095',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
    status: 'Active',
    registeredEventsCount: 2,
    attendedCount: 1,
    joinedDate: '2025-08-18',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11003',
  },
  {
    id: 'usr-std-004',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu',
    role: 'student',
    rollNumber: 'EC-2023-033',
    department: 'Electronics & Communication',
    semester: '5th Semester',
    status: 'Active',
    registeredEventsCount: 2,
    attendedCount: 2,
    joinedDate: '2025-08-20',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11004',
  },
  {
    id: 'usr-std-005',
    name: 'Aryan Verma',
    email: 'aryan.verma@college.edu',
    role: 'student',
    rollNumber: 'CS-2024-112',
    department: 'Computer Science & Engineering',
    semester: '3rd Semester',
    status: 'Suspended',
    registeredEventsCount: 1,
    attendedCount: 0,
    joinedDate: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11005',
  },
  {
    id: 'usr-std-006',
    name: 'Neha Gupta',
    email: 'neha.gupta@college.edu',
    role: 'student',
    rollNumber: 'IT-2023-067',
    department: 'Information Technology',
    semester: '5th Semester',
    status: 'Active',
    registeredEventsCount: 3,
    attendedCount: 2,
    joinedDate: '2025-08-22',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11006',
  },
  {
    id: 'usr-std-007',
    name: 'Kavya Reddy',
    email: 'kavya.reddy@college.edu',
    role: 'student',
    rollNumber: 'CS-2022-014',
    department: 'Computer Science & Engineering',
    semester: '7th Semester',
    status: 'Active',
    registeredEventsCount: 5,
    attendedCount: 4,
    joinedDate: '2024-08-12',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11007',
  },
  {
    id: 'usr-std-008',
    name: 'Vikram Singh',
    email: 'vikram.singh@college.edu',
    role: 'student',
    rollNumber: 'IT-2023-054',
    department: 'Information Technology',
    semester: '5th Semester',
    status: 'Pending',
    registeredEventsCount: 1,
    attendedCount: 0,
    joinedDate: '2026-09-01',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11008',
  },
  {
    id: 'usr-std-009',
    name: 'Devansh Joshi',
    email: 'devansh.joshi@college.edu',
    role: 'student',
    rollNumber: 'IT-2022-088',
    department: 'Information Technology',
    semester: '7th Semester',
    status: 'Active',
    registeredEventsCount: 4,
    attendedCount: 3,
    joinedDate: '2024-08-14',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 11009',
  },
  {
    id: 'usr-std-010',
    name: 'Demo Student',
    email: 'student@example.com',
    role: 'student',
    rollNumber: 'DEMO-001',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    status: 'Active',
    registeredEventsCount: 2,
    attendedCount: 2,
    joinedDate: '2025-01-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 43210',
  },

  // --- ORGANIZERS ---
  {
    id: 'usr-org-001',
    name: 'Faculty Organizer',
    email: 'organizer@example.com',
    role: 'organizer',
    department: 'CSE Tech Society / Faculty Coordinator',
    status: 'Active',
    eventsCreatedCount: 3,
    publishedCount: 2,
    joinedDate: '2024-06-10',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 01234',
  },
  {
    id: 'usr-org-002',
    name: 'Dr. R. K. Mukherjee',
    email: 'rkm@college.edu',
    role: 'organizer',
    department: 'Turing Computing Society',
    status: 'Active',
    eventsCreatedCount: 2,
    publishedCount: 1,
    joinedDate: '2023-07-01',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 01235',
  },
  {
    id: 'usr-org-003',
    name: 'Dr. Preeti Deshmukh',
    email: 'preeti@college.edu',
    role: 'organizer',
    department: 'Innovation & Incubation Cell (IIC)',
    status: 'Active',
    eventsCreatedCount: 1,
    publishedCount: 1,
    joinedDate: '2024-02-15',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 01236',
  },
  {
    id: 'usr-org-004',
    name: 'Coach Dilip Rathore',
    email: 'sports@college.edu',
    role: 'organizer',
    department: 'University Sports Council',
    status: 'Active',
    eventsCreatedCount: 1,
    publishedCount: 1,
    joinedDate: '2023-01-20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 01237',
  },
  {
    id: 'usr-org-005',
    name: 'Er. A. K. Varma',
    email: 'varma@college.edu',
    role: 'organizer',
    department: 'IEEE Student Branch',
    status: 'Active',
    eventsCreatedCount: 1,
    publishedCount: 1,
    joinedDate: '2024-04-10',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 01238',
  },
  {
    id: 'usr-org-006',
    name: 'Prof. S. Meenakshi',
    email: 'meenakshi@college.edu',
    role: 'organizer',
    department: 'Cultural Affairs Board',
    status: 'Active',
    eventsCreatedCount: 2,
    publishedCount: 2,
    joinedDate: '2023-11-05',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 01239',
  },

  // --- ADMINISTRATORS ---
  {
    id: 'usr-adm-001',
    name: 'Dr. Amitabh Sen',
    email: 'admin@college.edu',
    role: 'admin',
    department: 'Dean Academic Affairs / Central Administration',
    status: 'Active',
    joinedDate: '2022-01-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 00001',
  },
  {
    id: 'usr-adm-002',
    name: 'Campus IT Operations',
    email: 'sysadmin@college.edu',
    role: 'admin',
    department: 'Central Campus IT Cell',
    status: 'Active',
    joinedDate: '2022-03-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 00002',
  },
];

/**
 * Initial central announcements for the entire campus.
 */
export const INITIAL_ADMIN_ANNOUNCEMENTS = [
  {
    id: 'adm-ann-01',
    title: 'University Co-curricular Attendance Protocol 2026–27',
    message: 'Official guidelines regarding academic credit concessions for students participating in sanctioned hackathons and university sporting events have been updated.',
    priority: 'Urgent',
    pinned: true,
    targetAudience: 'All Campus',
    relatedEventTitle: 'General University Directive',
    eventId: 'all',
    author: 'Dean Academic Affairs',
    publishedAt: 'Nov 14, 2026 · 10:00 AM',
  },
  {
    id: 'adm-ann-02',
    title: 'Auditorium 1 & 2 Maintenance Notice',
    message: 'Scheduled AV sound system upgrades in Raman and Bhabha auditoriums from Nov 18–19. Event coordinators are advised to reroute rehearsal sessions to Seminar Complex.',
    priority: 'Important',
    pinned: false,
    targetAudience: 'Organizers',
    relatedEventTitle: 'Campus Infrastructure',
    eventId: 'all',
    author: 'Campus IT Operations',
    publishedAt: 'Nov 12, 2026 · 02:30 PM',
  },
  {
    id: 'adm-ann-03',
    title: 'Hackathon 2026 Lab Allocation & Security Clearance',
    message: 'Computing Hub Block 4 labs 301–304 confirmed for overnight coding sprint on Nov 28–29. Security access passes issued.',
    priority: 'Normal',
    pinned: false,
    targetAudience: 'Event Participants',
    relatedEventTitle: 'Hackathon 2026',
    eventId: 'evt-hackathon-2026',
    author: 'Faculty Organizer',
    publishedAt: 'Nov 11, 2026 · 04:15 PM',
  },
];

/**
 * Initial admin audit activity feed.
 */
export const INITIAL_ADMIN_AUDIT_LOG = [
  {
    id: 'aud-01',
    title: 'Student Account Activated',
    description: 'Vikram Singh (IT-2023-054) verification approved',
    timestamp: '10m ago',
    category: 'user',
  },
  {
    id: 'aud-02',
    title: 'Event Approved for Publication',
    description: 'Campus E-Summit 2026 approved by Academic Dean',
    timestamp: '1h ago',
    category: 'event',
  },
  {
    id: 'aud-03',
    title: 'Policy Announcement Broadcasted',
    description: 'Co-curricular Attendance Protocol sent campus-wide',
    timestamp: '4h ago',
    category: 'announcement',
  },
  {
    id: 'aud-04',
    title: 'User Access Suspended',
    description: 'Aryan Verma (CS-2024-112) suspended pending inquiry',
    timestamp: '1d ago',
    category: 'user',
  },
];

/**
 * Calculates admin-level platform metrics.
 */
export function calculateAdminMetrics(users = INITIAL_ALL_USERS, events = [], registrations = []) {
  const totalUsers = users.length;
  const students = users.filter((u) => u.role === 'student');
  const organizers = users.filter((u) => u.role === 'organizer');
  const admins = users.filter((u) => u.role === 'admin');

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;
  const draftEvents = events.filter((e) => e.status === 'DRAFT').length;
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length;
  const cancelledEvents = events.filter((e) => e.status === 'CANCELLED').length;

  const totalRegistrations = registrations.filter((r) => r.status === 'Confirmed').length;
  const totalAttended = registrations.filter((r) => r.attendanceStatus === 'Present').length;
  const overallAttendanceRate = totalRegistrations > 0
    ? Math.round((totalAttended / totalRegistrations) * 100)
    : 0;

  return {
    totalUsers,
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'Active').length,
    totalOrganizers: organizers.length,
    activeOrganizers: organizers.filter((o) => o.status === 'Active').length,
    totalAdmins: admins.length,
    totalEvents,
    publishedEvents,
    draftEvents,
    completedEvents,
    cancelledEvents,
    totalRegistrations,
    totalAttended,
    overallAttendanceRate,
  };
}

/**
 * User monthly growth trend simulation (July - November 2026).
 */
export const MOCK_USER_GROWTH_DATA = [
  { month: 'Jul', students: 120, organizers: 8, height: '30%' },
  { month: 'Aug', students: 340, organizers: 14, height: '55%' },
  { month: 'Sep', students: 580, organizers: 19, height: '75%' },
  { month: 'Oct', students: 820, organizers: 22, height: '90%' },
  { month: 'Nov', students: 1040, organizers: 25, height: '100%' },
];
