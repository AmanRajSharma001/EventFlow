import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LogOut, Menu, UserRound, X } from 'lucide-react';
import Button from '../common/Button';
import ApiStatusIndicator from '../common/ApiStatusIndicator';
import { useAuth } from '../../hooks/useAuth';

const navigationLinks = [
  {
    to: '/events',
    label: 'Discover events',
    match: (path, hash) => path.startsWith('/events') && hash !== '#categories',
  },
  {
    to: '/events#categories',
    label: 'Categories',
    match: (path, hash) => path.startsWith('/events') && hash === '#categories',
  },
  { to: '/#students', label: 'For students', match: (_path, hash) => hash === '#students' },
  { to: '/#organizers', label: 'For organizers', match: (_path, hash) => hash === '#organizers' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMobileMenuOpen]);

  const linkClass = (active = false) =>
    `inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none ${active
      ? 'bg-blue-50 text-blue-700 font-semibold'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const accountActions = isAuthenticated ? (
    <div className="flex items-center gap-2">
      {user.role === 'student' && (
        <Button
          as={Link}
          to="/student/dashboard"
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Dashboard
        </Button>
      )}
      {user.role === 'organizer' && (
        <Button
          as={Link}
          to="/organizer/dashboard"
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Organizer Portal
        </Button>
      )}
      {user.role === 'admin' && (
        <Button
          as={Link}
          to="/admin/dashboard"
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          Admin Portal
        </Button>
      )}
      <Link
        to={
          user.role === 'admin'
            ? '/admin/dashboard'
            : user.role === 'organizer'
              ? '/organizer/dashboard'
              : user.role === 'student'
                ? '/student/dashboard'
                : '/'
        }
        className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:border-slate-300 transition-colors"
      >
        <span
          aria-hidden="true"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white"
        >
          {user.name?.trim()?.charAt(0)?.toUpperCase() || <UserRound className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 text-left">
          <span className="block max-w-28 truncate text-xs font-semibold text-slate-900">{user.name}</span>
          <span className="block text-[11px] capitalize text-slate-500">
            {user.role} {user.isDemoSession ? 'preview' : 'live'}
          </span>
        </span>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          logout();
          setIsMobileMenuOpen(false);
        }}
        icon={LogOut}
      >
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button as={Link} to="/login" variant="ghost" size="sm">
        Sign in
      </Button>
      <Button as={Link} to="/register" size="sm">
        Get started
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="ef-container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white transition-colors group-hover:bg-blue-700">
            <CalendarDays aria-hidden="true" className="h-4.5 w-4.5" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">
            Event<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex">
          {navigationLinks.map((item) => {
            const active = item.match(location.pathname, location.hash);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={linkClass(active)}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ApiStatusIndicator />
          {accountActions}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-navigation"
        hidden={!isMobileMenuOpen}
        className="border-t border-slate-200 bg-white lg:hidden"
      >
        <nav aria-label="Mobile navigation" className="ef-container flex flex-col gap-1 py-3">
          {isAuthenticated && user?.role === 'student' && (
            <Link
              to="/student/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
            >
              <span>Student Dashboard</span>
              <span>→</span>
            </Link>
          )}
          {isAuthenticated && user?.role === 'organizer' && (
            <Link
              to="/organizer/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
            >
              <span>Organizer Portal</span>
              <span>→</span>
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-lg bg-blue-50 px-3 text-sm font-semibold text-blue-700"
            >
              <span>Admin Control Center</span>
              <span>→</span>
            </Link>
          )}
          {navigationLinks.map((item) => {
            const active = item.match(location.pathname, location.hash);
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${linkClass(active)} min-h-11 justify-start px-3`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-slate-100 pt-3 flex flex-col gap-3">
            <div className="flex justify-start">
              <ApiStatusIndicator />
            </div>
            {accountActions}
          </div>
        </nav>
      </div>
    </header>
  );
}
