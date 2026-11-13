import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { OrganizerProvider } from './context/OrganizerContext';
import { AdminProvider } from './context/AdminContext';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailsPage from './pages/public/EventDetailsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ProtectedRoute from './components/student/ProtectedRoute';
import StudentLayout from './components/student/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentRegistrationsPage from './pages/student/StudentRegistrationsPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentTicketsPage from './pages/student/StudentTicketsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import OrganizerLayout from './components/organizer/OrganizerLayout';
import OrganizerDashboardPage from './pages/organizer/OrganizerDashboardPage';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import OrganizerCreateEventPage from './pages/organizer/OrganizerCreateEventPage';
import OrganizerEditEventPage from './pages/organizer/OrganizerEditEventPage';
import OrganizerRegistrationsPage from './pages/organizer/OrganizerRegistrationsPage';
import OrganizerAttendancePage from './pages/organizer/OrganizerAttendancePage';
import OrganizerAnnouncementsPage from './pages/organizer/OrganizerAnnouncementsPage';
import OrganizerProfilePage from './pages/organizer/OrganizerProfilePage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminOrganizersPage from './pages/admin/AdminOrganizersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import Button from './components/common/Button';
import { ArrowLeft, Construction } from 'lucide-react';
import EmptyState from './components/common/EmptyState';

function RouteScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    let targetId = hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      // Keep malformed percent-encoded hashes from interrupting route rendering.
    }

    const animationFrame = requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(targetId)?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [pathname, hash]);

  return null;
}

function EventsRoute() {
  const { search } = useLocation();
  return <EventsPage key={search} />;
}

function PagePlaceholder({ title, description }) {
  return (
    <div className="ef-container py-14 sm:py-20">
      <EmptyState
        eyebrow="Page not found"
        title={title}
        description={description}
        icon={Construction}
        headingLevel={1}
        className="mx-auto max-w-2xl border-solid shadow-sm"
        action={(
          <Button as={Link} to="/" variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Home
          </Button>
        )}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrganizerProvider>
        <AdminProvider>
          <BrowserRouter>
            <RouteScrollManager />
            <Toaster position="top-right" />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="events" element={<EventsRoute />} />
                <Route path="events/:id" element={<EventDetailsPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route
                  path="*"
                  element={
                    <PagePlaceholder
                      title="Page Not Found"
                      description="The page you are looking for does not exist in the EventFlow portal."
                    />
                  }
                />
              </Route>

              {/* Student Portal Protected Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="registrations" element={<StudentRegistrationsPage />} />
                <Route path="attendance" element={<StudentAttendancePage />} />
                <Route path="tickets" element={<StudentTicketsPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
              </Route>

              {/* Organizer Portal Protected Routes */}
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute allowedRole="organizer">
                    <OrganizerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/organizer/dashboard" replace />} />
                <Route path="dashboard" element={<OrganizerDashboardPage />} />
                <Route path="events" element={<OrganizerEventsPage />} />
                <Route path="events/create" element={<OrganizerCreateEventPage />} />
                <Route path="events/:id/edit" element={<OrganizerEditEventPage />} />
                <Route path="events/:id/registrations" element={<OrganizerRegistrationsPage />} />
                <Route path="events/:id/attendance" element={<OrganizerAttendancePage />} />
                <Route path="events/:id/announcements" element={<OrganizerAnnouncementsPage />} />
                <Route path="profile" element={<OrganizerProfilePage />} />
              </Route>

              {/* Admin Portal Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="organizers" element={<AdminOrganizersPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="registrations" element={<AdminRegistrationsPage />} />
                <Route path="attendance" element={<AdminAttendancePage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </OrganizerProvider>
    </AuthProvider>
  );
}
