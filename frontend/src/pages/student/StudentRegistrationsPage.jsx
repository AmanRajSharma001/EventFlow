import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Compass,
  FileCheck2,
  MapPin,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockCollegeEvents } from '../../data/mockEvents';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import ConfirmationDialog from '../../components/student/ConfirmationDialog';

function getDemoRegistrations(registeredEventIds, cancelledEventIds) {
  return mockCollegeEvents
    .filter(
      (event) =>
        registeredEventIds.includes(event.id) ||
        cancelledEventIds.includes(event.id)
    )
    .map((event) => ({
      id: `demo-${event.id}`,
      registrationId: `demo-${event.id}`,
      eventId: event.id,
      statusLabel: cancelledEventIds.includes(event.id) ? 'Cancelled' : 'Confirmed',
      isCancelled: cancelledEventIds.includes(event.id),
      event,
    }));
}

export default function StudentRegistrationsPage() {
  const {
    registeredEventIds = [],
    cancelledEventIds = [],
    registrations = [],
    registrationSource,
    isLoadingRegistrations,
    registrationError,
    refreshRegistrations,
    cancelRegistration,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventToCancel, setEventToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const registrationRecords = useMemo(
    () =>
      registrationSource === 'live'
        ? registrations
        : getDemoRegistrations(registeredEventIds, cancelledEventIds),
    [cancelledEventIds, registeredEventIds, registrationSource, registrations]
  );

  const { upcomingList, pastList, cancelledList, allList } = useMemo(() => {
    const lists = {
      upcomingList: [],
      pastList: [],
      cancelledList: [],
      allList: [],
    };

    registrationRecords.forEach((registration) => {
      const event = registration.event || {};
      const isPast =
        event.isPast ||
        event.status === 'COMPLETED' ||
        event.status === 'Completed';
      const item = {
        ...registration,
        event,
        regStatus: registration.isCancelled
          ? 'Cancelled'
          : isPast
            ? 'Completed'
            : 'Confirmed',
      };

      lists.allList.push(item);
      if (registration.isCancelled) {
        lists.cancelledList.push(item);
      } else if (isPast) {
        lists.pastList.push(item);
      } else {
        lists.upcomingList.push(item);
      }
    });

    return lists;
  }, [registrationRecords]);

  const displayedList = useMemo(() => {
    let base = allList;
    if (activeTab === 'upcoming') base = upcomingList;
    if (activeTab === 'past') base = pastList;
    if (activeTab === 'cancelled') base = cancelledList;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return base;

    return base.filter(({ event }) =>
      [event.title, event.organizer, event.venue, event.location, event.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [activeTab, allList, cancelledList, pastList, searchQuery, upcomingList]);

  const handleConfirmCancel = async () => {
    if (!eventToCancel) return;

    setIsCancelling(true);
    const cancelled = await cancelRegistration(
      eventToCancel,
      eventToCancel.event.title
    );
    setIsCancelling(false);
    if (cancelled) setEventToCancel(null);
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingList.length },
    { id: 'past', label: 'Past / Completed', count: pastList.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelledList.length },
    { id: 'all', label: 'All Registrations', count: allList.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            My Registrations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track, review, manage, or cancel your campus event registrations.
          </p>
        </div>
        <Button as={Link} to="/events" variant="primary" size="md" icon={Compass}>
          Explore More Events
        </Button>
      </div>

      {registrationSource === 'demo' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
          Showing preview registrations stored in this browser. Live registrations appear after database integration is available.
        </div>
      )}

      {registrationError && (
        <ErrorState
          title="Unable to load registrations"
          description={registrationError}
          onRetry={refreshRegistrations}
        />
      )}

      {isLoadingRegistrations ? (
        <LoadingState label="Loading your registrations..." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Seats</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{upcomingList.length}</p>
              <p className="text-[11px] text-slate-400">Passes valid for upcoming entry</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Activities</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{pastList.length}</p>
              <p className="text-[11px] text-slate-400">Past campus participation</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Withdrawn / Cancelled</p>
              <p className="mt-1 text-2xl font-bold text-slate-600">{cancelledList.length}</p>
              <p className="text-[11px] text-slate-400">Seats voluntarily released</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="ef-input pl-9"
              />
            </div>
          </div>

          {displayedList.length > 0 ? (
            <div className="space-y-4">
              {displayedList.map((registration) => {
                const { event } = registration;
                const isUpcoming = registration.regStatus === 'Confirmed';
                const isCancelled = registration.regStatus === 'Cancelled';

                return (
                  <article
                    key={registration.registrationId}
                    className={`flex flex-col justify-between gap-5 rounded-2xl border p-5 shadow-xs transition md:flex-row md:items-center ${
                      isCancelled
                        ? 'border-slate-200 bg-slate-50/70 opacity-80'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={event.imageUrl || '/favicon.svg'}
                        alt=""
                        className="h-20 w-24 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="blue" size="sm">{event.category || 'Campus event'}</Badge>
                          <Badge variant={isCancelled ? 'red' : isUpcoming ? 'success' : 'neutral'} size="sm">
                            {registration.regStatus}
                          </Badge>
                        </div>
                        <h2 className="mt-1.5 text-base font-bold text-slate-950">
                          <Link to={`/events/${registration.eventId}`} className="transition-colors hover:text-blue-600">
                            {event.title || 'Event'}
                          </Link>
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                            {event.date || event.startDate || 'Date to be announced'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {event.time || event.startTime || 'Time to be announced'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {event.venue || event.location || 'Venue to be announced'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-none md:pt-0">
                      {!isCancelled && isUpcoming && (
                        <Button
                          as={Link}
                          to={`/student/tickets?registration=${encodeURIComponent(registration.registrationId)}`}
                          variant="primary"
                          size="sm"
                        >
                          View Ticket
                        </Button>
                      )}
                      <Button as={Link} to={`/events/${registration.eventId}`} variant="secondary" size="sm">
                        Event Details
                      </Button>
                      {!isCancelled && isUpcoming && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setEventToCancel(registration)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileCheck2}
              title="No registrations found"
              description={
                searchQuery
                  ? `No registrations matched "${searchQuery}". Try a different keyword.`
                  : 'You have no registrations matching this tab.'
              }
              action={<Button as={Link} to="/events" size="sm" icon={Compass}>Browse Available Events</Button>}
            />
          )}
        </>
      )}

      <ConfirmationDialog
        isOpen={Boolean(eventToCancel)}
        onClose={() => setEventToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Registration?"
        description={`Are you sure you want to cancel your seat for "${eventToCancel?.event?.title}"? Your reservation will be released back to the event capacity pool.`}
        confirmLabel="Yes, Cancel Registration"
        cancelLabel="Keep My Seat"
        isDestructive
        isLoading={isCancelling}
      />
    </div>
  );
}
