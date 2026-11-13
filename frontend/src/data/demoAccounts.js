/**
 * Pre-configured demo accounts for quick testing and academic project review.
 * Separated cleanly from components and services.
 */
export const DEMO_ACCOUNTS = {
  student: {
    id: 'std-demo',
    name: 'Demo Student',
    email: 'student@example.com',
    rollNumber: 'DEMO-001',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    registeredEvents: ['evt-hackathon-2026', 'evt-ai-ml-workshop'],
  },
  organizer: {
    id: 'org-demo',
    name: 'Faculty Organizer',
    email: 'organizer@example.com',
    department: 'CSE Tech Society / Faculty Coordinator',
    role: 'organizer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    managedEvents: ['evt-hackathon-2026'],
  },
  admin: {
    id: 'adm-demo',
    name: 'Dr. Amitabh Sen',
    email: 'admin@college.edu',
    department: 'Dean Academic Affairs / Central Administration',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
};
