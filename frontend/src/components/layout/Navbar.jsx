import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LogOut, Menu, UserRound, X } from 'lucide-react';
import Button from '../common/Button';
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
    `inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none ${active ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`;

  const accountActions = isAuthenticated ? (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {user.name?.trim()?.charAt(0)?.toUpperCase() || <UserRound className="h-4 w-4" />}
        </span>
        <span className="min-w-0 text-left">
          <span className="block max-w-32 truncate text-xs font-semibold text-slate-900">{user.name}</span>
          <span className="block text-[11px] capitalize text-slate-500">{user.role} preview</span>
        </span>
      </div>
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
        Sign out
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Button as={Link} to="/login" variant="ghost" size="sm">Sign in</Button>
      <Button as={Link} to="/register" size="sm">Student sign up</Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
      <div className="ef-container flex h-[4.25rem] items-center justify-between gap-3 sm:gap-5">
        <Link to="/" className="group flex shrink-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white transition-colors group-hover:bg-indigo-700 motion-reduce:transition-none">
            <CalendarDays aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <span>
            <span className="block text-[17px] font-bold leading-5 tracking-tight text-slate-950">Event<span className="text-indigo-700">Flow</span></span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Campus events</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {navigationLinks.map((item) => {
            const active = item.match(location.pathname, location.hash);
            return (
              <Link key={item.label} to={item.to} className={linkClass(active)} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center lg:flex">{accountActions}</div>

        <button
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-700 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none lg:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        hidden={!isMobileMenuOpen}
        className="border-t border-slate-200 bg-white lg:hidden"
      >
        <nav aria-label="Mobile navigation" className="ef-container flex flex-col gap-1 py-3">
          {navigationLinks.map((item) => {
            const active = item.match(location.pathname, location.hash);
            return (
              <Link key={item.label} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={`${linkClass(active)} min-h-12 px-3`} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 border-t border-slate-100 pt-3">{accountActions}</div>
        </nav>
      </div>
    </header>
  );
}
