import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from 'lucide-react';
import Badge from '../common/Badge';
import {
  getEventCapacity,
  getEventStatus,
  getEventStatusVariant,
  isPastEvent,
} from '../../utils/eventUtils';

export default function EventCard({ event }) {
  const [imageFailed, setImageFailed] = useState(false);
  const past = isPastEvent(event);
  const status = getEventStatus(event);
  const { attendeesCount, maxSeats, seatsLeft, percentFilled } = getEventCapacity(event);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 motion-reduce:transition-none">
      <Link
        to={`/events/${event.id}`}
        className="relative block aspect-[16/9] overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-indigo-500"
        aria-label={`View details for ${event.title}`}
      >
        {imageFailed ? (
          <div className="flex h-full items-center justify-center bg-slate-100 px-6 text-center text-sm font-medium text-slate-500">
            Event image unavailable
          </div>
        ) : (
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${past ? 'grayscale-[25%]' : ''}`}
          />
        )}
        <div className="absolute left-4 top-4">
          <Badge variant="default" className="bg-white/95 text-slate-800 shadow-sm">
            {event.category}
          </Badge>
        </div>
        <div className="absolute right-4 top-4">
          <Badge variant={getEventStatusVariant(status)}>
            {past && <CheckCircle2 aria-hidden="true" className="mr-1 h-3.5 w-3.5" />}
            {status}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {event.organizer}
        </p>
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-slate-950">
          <Link
            to={`/events/${event.id}`}
            className="rounded-sm outline-none transition-colors hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {event.title}
          </Link>
        </h2>

        <dl className="mt-4 space-y-2.5 text-sm text-slate-600">
          <div className="flex items-start gap-2.5">
            <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <dt className="sr-only">Date</dt>
              <dd className="font-medium text-slate-800"><time dateTime={event.startDate}>{event.date}</time></dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <dt className="sr-only">Time</dt>
              <dd>{event.time}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <dt className="sr-only">Venue</dt>
              <dd className="line-clamp-2">{event.venue}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-auto pt-5">
          {maxSeats > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <Users aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    <strong className="font-semibold text-slate-900">{attendeesCount}</strong>
                    <span> / {maxSeats} places</span>
                  </span>
                </span>
                <span className={`shrink-0 font-medium ${past || seatsLeft === 0 ? 'text-slate-500' : 'text-emerald-700'}`}>
                  {past ? 'Event ended' : seatsLeft === 0 ? 'Full' : `${seatsLeft} places left`}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`Sample capacity: ${attendeesCount} of ${maxSeats} places`}
                aria-valuemin={0}
                aria-valuemax={maxSeats}
                aria-valuenow={attendeesCount}
                className="h-1.5 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className={`h-full rounded-full ${percentFilled >= 85 ? 'bg-amber-500' : 'bg-slate-900'}`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-xs font-semibold text-slate-700">
              {event.price || 'Free'}
            </span>
            <Link
              to={`/events/${event.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold text-indigo-700 outline-none transition-colors hover:text-indigo-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Details
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
