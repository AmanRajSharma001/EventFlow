import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, ImageOff, MapPin, Users } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EventCard from '../../components/events/EventCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  getEventCapacity,
  getEventStatus,
  getEventStatusVariant,
  getFallbackCatalogEvents,
  isPastEvent,
} from '../../utils/eventUtils';
import { useAuth } from '../../hooks/useAuth';
import { eventsService } from '../../services/events.service';
import { isDatabasePendingError } from '../../services/dbStatus';

export default function EventDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const {
    user,
    registeredEventIds,
    registerForEvent,
    unregisterFromEvent,
    registrationSource,
  } = useAuth();

  // Async data & hybrid fallback state
  const [event, setEvent] = useState(() => {
    return getFallbackCatalogEvents().find((item) => item.id === id) || null;
  });
  const [isLoading, setIsLoading] = useState(!event);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [allEvents] = useState(getFallbackCatalogEvents);

  useEffect(() => {
    let isMounted = true;

    async function loadEvent() {
      setError(null);
      setNotFound(false);

      try {
        const liveEvent = await eventsService.getEventById(id);
        if (isMounted) {
          if (liveEvent) {
            setEvent(liveEvent);
            setIsUsingFallback(false);
          } else {
            setEvent(null);
            setNotFound(true);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        if (isDatabasePendingError(err)) {
          const fallbackList = getFallbackCatalogEvents();
          const found = fallbackList.find((item) => item.id === id);
          if (found) {
            setEvent(found);
            setIsUsingFallback(true);
            setError(null);
          } else {
            setNotFound(true);
          }
        } else {
          setEvent(null);
          setError(err?.response?.data?.message || err.message || 'Failed to load event details.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading && !event) {
    return (
      <div className="ef-container py-16 sm:py-24">
        <LoadingState label="Loading event details..." />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="ef-container py-16 sm:py-24">
        <ErrorState
          title="Unable to load event details"
          description={error}
          onRetry={() => window.location.reload()}
          action={
            <Button as={Link} to="/events" variant="secondary" icon={ArrowLeft}>
              Back to event catalog
            </Button>
          }
        />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="ef-container py-16 sm:py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Event not found</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">We couldn’t find that event.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">The event may have been removed or does not exist.</p>
          <Button as={Link} to="/events" className="mt-6" icon={ArrowLeft}>Back to event catalog</Button>
        </div>
      </div>
    );
  }

  const past = isPastEvent(event);
  const status = getEventStatus(event);
  const { attendeesCount, maxSeats, seatsLeft, percentFilled } = getEventCapacity(event);
  const isRegistered = registeredEventIds.includes(event.id);
  const canRegister = user?.role === 'student';
  const isFull = maxSeats > 0 && seatsLeft === 0;
  const isClosed = event.status === 'Closed' || isFull;
  const relatedEvents = (allEvents || [])
    .filter((item) => item.id !== event.id && !isPastEvent(item))
    .sort((a, b) => {
      const categoryPriority = Number(b.category === event.category) - Number(a.category === event.category);
      return categoryPriority || new Date(a.startDate) - new Date(b.startDate);
    })
    .slice(0, 3);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setIsSubmittingRegistration(true);
    await registerForEvent(event.id, event.title);
    setIsSubmittingRegistration(false);
  };

  const handleWithdraw = async () => {
    setIsSubmittingRegistration(true);
    await unregisterFromEvent(event.id, event.title);
    setIsSubmittingRegistration(false);
  };

  return (
    <div>
      <div className="ef-container pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/events" className="rounded-sm font-medium hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Events</Link></li>
            <li aria-hidden="true">/</li>
            <li className="max-w-[min(70vw,36rem)] truncate font-medium text-slate-800" aria-current="page">{event.title}</li>
          </ol>
        </nav>

        {/* Fallback indicator */}
        {isUsingFallback && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
              <span>Showing sample event listing (Database integration pending).</span>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-700">Demo Active</span>
          </div>
        )}

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
          {imageFailed ? (
            <div aria-hidden="true" className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-slate-900 text-slate-300 sm:h-80 lg:h-104">
              <ImageOff className="h-8 w-8" />
              <span className="text-sm font-medium">Event cover unavailable</span>
            </div>
          ) : (
            <img
              src={event.imageUrl}
              alt=""
              onError={() => setImageFailed(true)}
              className="h-64 w-full object-cover sm:h-80 lg:h-104"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="border-white/30 bg-white/95 text-slate-900">{event.category}</Badge>
              <Badge variant={getEventStatusVariant(status)}>{status}</Badge>
            </div>
            <h1 className="max-w-4xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{event.title}</h1>
            <p className="text-sm text-white/85 sm:text-base">Hosted by {event.organizer}</p>
          </div>
        </div>
      </div>

      <div className="ef-container grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="order-2 min-w-0 lg:order-1">
          <section aria-labelledby="event-overview-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Event overview</p>
            <h2 id="event-overview-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">About this event</h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-slate-600">{event.description}</p>
          </section>

          <section aria-labelledby="event-details-heading" className="mt-9 border-t border-slate-200 pt-7">
            <h2 id="event-details-heading" className="text-xl font-semibold tracking-tight text-slate-950">Event details</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</dt><dd className="mt-1 text-sm font-medium text-slate-900">{event.date || event.startDate}</dd></div>
              </div>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Clock3 aria-hidden="true" className="h-5 w-5" /></span>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time</dt><dd className="mt-1 text-sm font-medium text-slate-900">{event.time || (event.startTime ? `${event.startTime} - ${event.endTime || ''}` : 'TBD')}</dd></div>
              </div>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><MapPin aria-hidden="true" className="h-5 w-5" /></span>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Venue</dt><dd className="mt-1 text-sm font-medium text-slate-900">{event.venue || event.location}</dd></div>
              </div>
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Users aria-hidden="true" className="h-5 w-5" /></span>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Department</dt><dd className="mt-1 text-sm font-medium text-slate-900">{event.department || 'General'}</dd></div>
              </div>
            </dl>
          </section>

          <section aria-labelledby="organizer-heading" className="mt-9 border-t border-slate-200 pt-7">
            <h2 id="organizer-heading" className="text-xl font-semibold tracking-tight text-slate-950">Organizer</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Club or department</dt><dd className="mt-1 text-sm font-medium text-slate-900">{event.organizer || 'Campus Council'}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coordinator</dt><dd className="mt-1 text-sm font-medium text-slate-900">{event.coordinator || 'Staff Coordinator'}</dd></div>
            </dl>
          </section>

          {event.tags?.length > 0 && (
            <section aria-label="Event topics" className="mt-8 flex flex-wrap gap-2">
              {event.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
            </section>
          )}
        </div>

        <aside className="order-1 h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Registration</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{event.price || 'Free'}</p>
          {maxSeats > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">Sample capacity</span>
                <span className="font-semibold text-slate-950">{attendeesCount} / {maxSeats}</span>
              </div>
              <div role="progressbar" aria-label={`Sample capacity: ${attendeesCount} of ${maxSeats} places`} aria-valuemin={0} aria-valuemax={maxSeats} aria-valuenow={attendeesCount} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${percentFilled >= 85 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${percentFilled}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-600">{past ? 'Registration has ended.' : isFull ? 'No sample places remain.' : isClosed ? 'Registration is closed.' : `${seatsLeft} sample places remaining.`}</p>
            </div>
          )}

          <div className="mt-5">
            {past ? (
              <Button type="button" disabled className="w-full">Event has ended</Button>
            ) : isClosed ? (
              <Button type="button" disabled className="w-full">{isFull ? 'Registration full' : 'Registration closed'}</Button>
            ) : isRegistered && canRegister ? (
              <Button type="button" variant="secondary" className="w-full" onClick={handleWithdraw} disabled={isSubmittingRegistration}>
                {isSubmittingRegistration ? 'Updating registration...' : 'Withdraw registration'}
              </Button>
            ) : canRegister ? (
              <Button type="button" className="w-full" onClick={handleRegister} disabled={isSubmittingRegistration}>
                {isSubmittingRegistration ? 'Registering...' : 'Register for this event'}
              </Button>
            ) : user ? (
              <Button type="button" disabled className="w-full">Student account required</Button>
            ) : (
              <Button as={Link} to="/login" state={{ from: location.pathname }} className="w-full">Sign in to register</Button>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {isRegistered && canRegister
              ? registrationSource === 'live'
                ? 'Your live registration is linked to your EventFlow account.'
                : 'This preview registration is saved in this browser only.'
              : registrationSource === 'live'
                ? 'Registration status is connected to the EventFlow service.'
                : 'Sample event details and local preview registration; no campus service is connected.'}
          </p>
          <Link to="/events" className="mt-5 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to event catalog
          </Link>
        </aside>
      </div>

      {relatedEvents.length > 0 && (
        <section aria-labelledby="related-events-heading" className="border-t border-slate-200 bg-white py-10 sm:py-14">
          <div className="ef-container">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Keep exploring</p>
                <h2 id="related-events-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Related sample events</h2>
              </div>
              <Button as={Link} to="/events" variant="secondary" icon={ArrowRight} iconPosition="right">View event catalog</Button>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedEvents.map((item) => <EventCard key={item.id} event={item} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
