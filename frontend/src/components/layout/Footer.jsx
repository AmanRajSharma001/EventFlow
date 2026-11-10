import { Link } from 'react-router-dom';
import { CalendarDays, ArrowUpRight } from 'lucide-react';
import { mockCategories } from '../../data/mockEvents';

const footerLinkClass = 'rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="ef-container py-11 sm:py-14">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white">
                <CalendarDays aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">Event<span className="text-indigo-300">Flow</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Your starting point for events hosted by campus clubs, councils, and departments.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">Explore</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><Link to="/#upcoming-events" className={footerLinkClass}>Upcoming events</Link></li>
              <li><Link to="/#campus-groups" className={footerLinkClass}>Campus groups</Link></li>
              <li><Link to="/events#categories" className={footerLinkClass}>Event categories</Link></li>
              <li><Link to="/#students" className={footerLinkClass}>For students</Link></li>
              <li><Link to="/#organizers" className={footerLinkClass}>For organizers</Link></li>
            </ul>
          </nav>

          <nav aria-label="Event categories">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">Browse categories</h2>
              <Link to="/events" aria-label="View all events" className={`${footerLinkClass} text-slate-400`}>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-400">
              {mockCategories.filter((category) => category.id !== 'all').map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/events?category=${encodeURIComponent(category.id)}#categories`}
                    className={footerLinkClass}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© EventFlow</p>
          <p>Sample experience · Campus listings are for demonstration</p>
        </div>
      </div>
    </footer>
  );
}
