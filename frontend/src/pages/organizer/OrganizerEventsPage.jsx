import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Edit,
  MapPin,
  Megaphone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { useOrganizer } from '../../hooks/useOrganizer';
import EventStatusBadge from '../../components/organizer/EventStatusBadge';
import ConfirmationDialog from '../../components/student/ConfirmationDialog';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export default function OrganizerEventsPage() {
  const { events, deleteEvent, isLiveSync, eventsError } = useOrganizer();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-asc');
  const [eventToDelete, setEventToDelete] = useState(null);

  // Filter & sort events
  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        if (statusFilter !== 'ALL' && evt.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          evt.title.toLowerCase().includes(q) ||
          evt.venue.toLowerCase().includes(q) ||
          evt.category.toLowerCase().includes(q) ||
          evt.department.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.startDate || 0) - new Date(a.startDate || 0);
        if (sortBy === 'registrations') return (b.attendeesCount || 0) - (a.attendeesCount || 0);
        if (sortBy === 'capacity') return (b.maxSeats || 0) - (a.maxSeats || 0);
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      });
  }, [events, statusFilter, searchQuery, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    await deleteEvent(eventToDelete.id);
    setEventToDelete(null);
  };

  const statusOptions = [
    { id: 'ALL', label: 'All Events', count: events.length },
    { id: 'PUBLISHED', label: 'Published', count: events.filter((e) => e.status === 'PUBLISHED').length },
    { id: 'DRAFT', label: 'Drafts', count: events.filter((e) => e.status === 'DRAFT').length },
    { id: 'COMPLETED', label: 'Completed', count: events.filter((e) => e.status === 'COMPLETED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: events.filter((e) => e.status === 'CANCELLED').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Event Management
            </h1>
            {!isLiveSync && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                Demo Fallback
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Publish, edit, monitor enrollment, and organize activities hosted by your council.
          </p>
        </div>

        <Button
          as={Link}
          to="/organizer/events/create"
          variant="primary"
          size="md"
          icon={Plus}
        >
          Create New Event
        </Button>
      </div>

      {eventsError && (
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-800">
          {eventsError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div
          className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
          role="tablist"
        >
          {statusOptions.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={statusFilter === tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Group */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search title, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ef-input pl-9 text-xs"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ef-input text-xs"
            >
              <option value="date-asc">Date: Soonest first</option>
              <option value="date-desc">Date: Latest first</option>
              <option value="registrations">Most registered</option>
              <option value="capacity">Largest capacity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Event List Cards */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((evt) => {
            const isDraft = evt.status === 'DRAFT';
            const isPublished = evt.status === 'PUBLISHED';
            const percentFilled = Math.min(
              100,
              Math.round(((evt.attendeesCount || 0) / (evt.maxSeats || 100)) * 100)
            );

            return (
              <article
                key={evt.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                {/* Event Image & Details */}
                <div className="flex gap-4 min-w-0 flex-1">
                  <img
                    src={evt.imageUrl}
                    alt=""
                    className="h-24 w-32 shrink-0 rounded-xl object-cover bg-slate-100"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <EventStatusBadge status={evt.status} />
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {evt.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        ID: {evt.id}
                      </span>
                    </div>

                    <h2 className="mt-1.5 text-base font-bold text-slate-950 truncate">
                      <Link
                        to={`/organizer/events/${evt.id}/registrations`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {evt.title}
                      </Link>
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {evt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {evt.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {evt.venue}
                      </span>
                    </div>

                    {/* Progress capacity indicator */}
                    <div className="mt-3 flex items-center gap-3 text-xs max-w-sm">
                      <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                        {evt.attendeesCount || 0} / {evt.maxSeats} seats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Actions & Navigation */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-none md:pt-0">
                  <Button
                    as={Link}
                    to={`/organizer/events/${evt.id}/registrations`}
                    variant="secondary"
                    size="xs"
                    icon={Users}
                  >
                    Registrations
                  </Button>

                  <Button
                    as={Link}
                    to={`/organizer/events/${evt.id}/attendance`}
                    variant="secondary"
                    size="xs"
                    icon={UserCheck}
                  >
                    Attendance
                  </Button>

                  <Button
                    as={Link}
                    to={`/organizer/events/${evt.id}/announcements`}
                    variant="secondary"
                    size="xs"
                    icon={Megaphone}
                  >
                    Alerts
                  </Button>

                  <Button
                    as={Link}
                    to={`/organizer/events/${evt.id}/edit`}
                    variant="ghost"
                    size="xs"
                    icon={Edit}
                  >
                    Edit
                  </Button>

                  {/* Publish / Unpublish Toggle */}
                  {isDraft && (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setEventStatus(evt.id, 'PUBLISHED')}
                    >
                      Publish
                    </Button>
                  )}
                  {isPublished && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setEventStatus(evt.id, 'DRAFT')}
                    >
                      Unpublish
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={() => setEventToDelete(evt)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label="Delete Event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description={
            searchQuery
              ? `No events matched "${searchQuery}". Try a different search query.`
              : 'You have no events matching this filter category.'
          }
          action={
            <Button as={Link} to="/organizer/events/create" size="sm" icon={Plus}>
              Create a New Event
            </Button>
          }
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event?"
        description={`Are you sure you want to delete "${eventToDelete?.title}"? All associated registrations, attendance checkpoints, and announcements will be removed from local state.`}
        confirmLabel="Yes, Delete Event"
        cancelLabel="Keep Event"
        isDestructive={true}
      />
    </div>
  );
}
