import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  CheckCheck,
  Compass,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const sidebarNavigation = [
  { name: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Explore Events', to: '/events', icon: Compass },
  { name: 'My Registrations', to: '/student/registrations', icon: FileCheck2 },
  { name: 'My Attendance', to: '/student/attendance', icon: CalendarDays },
  { name: 'My Tickets', to: '/student/tickets', icon: Ticket },
  { name: 'My Profile', to: '/student/profile', icon: User },
];

export default function StudentLayout() {
  const {
    user,
    logout,
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Derive current title from route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/student/dashboard':
        return 'Student Overview';
      case '/student/registrations':
        return 'My Registrations';
      case '/student/attendance':
        return 'My Attendance & Records';
      case '/student/tickets':
        return 'My Event Tickets';
      case '/student/profile':
        return 'Student Profile';
      default:
        return 'Student Portal';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop fixed/sticky, Mobile drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <Link
            to="/student/dashboard"
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white shadow-xs">
              <CalendarDays className="h-4.5 w-4.5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-950">
              Event<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Student Badge Card in Sidebar */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-bold text-white">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {user?.name || 'Student User'}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {user?.rollNumber || 'DEMO-001'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav
          aria-label="Student Navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        >
          {sidebarNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Sidebar Footer */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <nav aria-label="Breadcrumb" className="hidden sm:block">
                <ol className="flex items-center gap-1.5 text-xs text-slate-500">
                  <li>
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link to="/student/dashboard" className="hover:text-blue-600">Student</Link>
                  </li>
                  <li>/</li>
                  <li className="font-semibold text-slate-900">{getPageTitle()}</li>
                </ol>
              </nav>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-950 sm:hidden">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              as={Link}
              to="/events"
              variant="secondary"
              size="xs"
              icon={Compass}
              className="hidden md:inline-flex"
            >
              Explore Events
            </Button>

            {/* Notification Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-950">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark read
                        </button>
                      )}
                    </div>

                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`group relative cursor-pointer rounded-xl border p-3 transition-colors ${
                              n.read
                                ? 'border-slate-100 bg-white text-slate-500'
                                : 'border-blue-100 bg-blue-50/40 text-slate-900'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-semibold text-slate-950">
                                {n.title}
                              </h4>
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {n.time}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {n.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="py-6 text-center text-xs text-slate-500">
                          No notifications at this time.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Profile avatar link */}
            <Link
              to="/student/profile"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 pr-2.5 hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-7 w-7 rounded-md object-cover"
                />
              ) : (
                <div className="grid h-7 w-7 place-items-center rounded-md bg-blue-600 text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-24 truncate">
                {user?.name?.split(' ')[0] || 'Student'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
