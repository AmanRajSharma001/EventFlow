import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Compass,
  FileCheck2,
  MapPin,
  Search,
  Ticket,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockCollegeEvents } from '../../data/mockEvents';
import { generateTicketData } from '../../data/mockStudentData';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/student/ConfirmationDialog';
import TicketModal from '../../components/student/TicketModal';

export default function StudentRegistrationsPage() {
  const {
    user,
    registeredEventIds = [],
    cancelledEventIds = [],
    cancelRegistration,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [eventToCancel, setEventToCancel] = useState(null);

  // Group events by registration status
  const { upcomingList, pastList, cancelledList, allList } = useMemo(() => {
    const upcoming = [];
    const past = [];
    const cancelled = [];
    const all = [];

    mockCollegeEvents.forEach((event) => {
      const isRegistered = registeredEventIds.includes(event.id);
      const isCancelled = cancelledEventIds.includes(event.id);

      if (isCancelled) {
        cancelled.push({ ...event, regStatus: 'Cancelled' });
        all.push({ ...event, regStatus: 'Cancelled' });
      } else if (isRegistered) {
        if (event.isPast || event.status === 'Completed') {
          past.push({ ...event, regStatus: 'Completed' });
          all.push({ ...event, regStatus: 'Completed' });
        } else {
          upcoming.push({ ...event, regStatus: 'Confirmed' });
          all.push({ ...event, regStatus: 'Confirmed' });
        }
      }
    });

    return {
      upcomingList: upcoming,
      pastList: past,
      cancelledList: cancelled,
      allList: all,
    };
  }, [registeredEventIds, cancelledEventIds]);

  // Filter based on active tab and search query
  const displayedList = useMemo(() => {
    let base = allList;
    if (activeTab === 'upcoming') base = upcomingList;
    if (activeTab === 'past') base = pastList;
    if (activeTab === 'cancelled') base = cancelledList;

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [activeTab, allList, upcomingList, pastList, cancelledList, searchQuery]);

  const handleOpenTicket = (event) => {
    const ticket = generateTicketData(event, user);
    setSelectedTicket(ticket);
  };

  const handleConfirmCancel = () => {
    if (!eventToCancel) return;
    cancelRegistration(eventToCancel.id, eventToCancel.title);
    setEventToCancel(null);
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingList.length },
    { id: 'past', label: 'Past / Completed', count: pastList.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelledList.length },
    { id: 'all', label: 'All Registrations', count: allList.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            My Registrations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track, review, manage, or cancel your campus event registrations.
          </p>
        </div>

        <Button
          as={Link}
          to="/events"
          variant="primary"
          size="md"
          icon={Compass}
        >
          Explore More Events
        </Button>
      </div>

      {/* Summary Chips */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Seats
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {upcomingList.length}
          </p>
          <p className="text-[11px] text-slate-400">Passes valid for upcoming entry</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed Activities
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {pastList.length}
          </p>
          <p className="text-[11px] text-slate-400">Past campus participation</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Withdrawn / Cancelled
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-600">
            {cancelledList.length}
          </p>
          <p className="text-[11px] text-slate-400">Seats voluntarily released</p>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab pill group */}
        <div
          className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
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
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ef-input pl-9"
          />
        </div>
      </div>

      {/* List of Registrations */}
      {displayedList.length > 0 ? (
        <div className="space-y-4">
          {displayedList.map((event) => {
            const isUpcoming = event.regStatus === 'Confirmed';
            const isCancelled = event.regStatus === 'Cancelled';

            return (
              <article
                key={event.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border p-5 transition shadow-xs ${
                  isCancelled
                    ? 'border-slate-200 bg-slate-50/70 opacity-80'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Event Info */}
                <div className="flex gap-4">
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-20 w-24 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue" size="sm">
                        {event.category}
                      </Badge>
                      <Badge
                        variant={
                          isCancelled
                            ? 'red'
                            : isUpcoming
                            ? 'success'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {event.regStatus}
                      </Badge>
                    </div>

                    <h2 className="mt-1.5 text-base font-bold text-slate-950">
                      <Link
                        to={`/events/${event.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {event.title}
                      </Link>
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {event.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-none md:pt-0">
                  {!isCancelled && isUpcoming && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={Ticket}
                      onClick={() => handleOpenTicket(event)}
                    >
                      View Ticket
                    </Button>
                  )}

                  <Button
                    as={Link}
                    to={`/events/${event.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Event Details
                  </Button>

                  {!isCancelled && isUpcoming && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setEventToCancel(event)}
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
          action={
            <Button as={Link} to="/events" size="sm" icon={Compass}>
              Browse Available Events
            </Button>
          }
        />
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={Boolean(eventToCancel)}
        onClose={() => setEventToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Registration?"
        description={`Are you sure you want to cancel your seat for "${eventToCancel?.title}"? Your reservation will be released back to the event capacity pool.`}
        confirmLabel="Yes, Cancel Registration"
        cancelLabel="Keep My Seat"
        isDestructive={true}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />
    </div>
  );
}
