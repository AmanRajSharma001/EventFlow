import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import ConfirmationDialog from '../../components/student/ConfirmationDialog';
import EventStatusBadge from '../../components/organizer/EventStatusBadge';

export default function AdminEventsPage() {
  const { events, updateEventStatus, deleteEvent } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [eventToDelete, setEventToDelete] = useState(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [events]);

  // Counts for status tabs
  const counts = useMemo(() => {
    return {
      all: events.length,
      published: events.filter((e) => e.status === 'PUBLISHED').length,
      draft: events.filter((e) => e.status === 'DRAFT').length,
      completed: events.filter((e) => e.status === 'COMPLETED').length,
      cancelled: events.filter((e) => e.status === 'CANCELLED').length,
    };
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (statusFilter !== 'ALL' && event.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'ALL' && event.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(q) ||
          (event.venue || '').toLowerCase().includes(q) ||
          (event.category || '').toLowerCase().includes(q) ||
          (event.organizer?.name || '').toLowerCase().includes(q) ||
          (event.department || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, statusFilter, categoryFilter, searchQuery]);

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            University-Wide Event Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Event Moderation & Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, approve, publish, or suspend events across all academic and cultural departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            {events.length} Total Events Registered
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'ALL'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Events ({counts.all})
        </button>
        <button
          onClick={() => setStatusFilter('PUBLISHED')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'PUBLISHED'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Published ({counts.published})
        </button>
        <button
          onClick={() => setStatusFilter('DRAFT')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'DRAFT'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Draft / Pending ({counts.draft})
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'COMPLETED'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Completed ({counts.completed})
        </button>
        <button
          onClick={() => setStatusFilter('CANCELLED')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            statusFilter === 'CANCELLED'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Cancelled ({counts.cancelled})
        </button>
      </div>

      {/* Controls: Search and Category */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, venue, organizer, department..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Organizer & Dept</th>
                <th className="py-3 px-4">Schedule & Venue</th>
                <th className="py-3 px-4">Seats / Registrations</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No events found matching your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching status tabs or clear the search query</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Event & Category */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        {evt.image ? (
                          <img
                            src={evt.image}
                            alt={evt.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <Calendar className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate" title={evt.title}>
                            {evt.title}
                          </p>
                          <span className="inline-block mt-0.5 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {evt.category || 'Event'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Organizer & Dept */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 text-xs">
                        {evt.organizer?.name || evt.organizerName || 'Faculty Lead'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {evt.department || 'Campus Department'}
                      </p>
                    </td>

                    {/* Schedule & Venue */}
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {evt.startDate || 'TBD'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.venue || 'Campus Auditorium'}
                      </div>
                    </td>

                    {/* Capacity & Registrations */}
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        {evt.attendeesCount || 0} / {evt.maxSeats || '∞'}
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((evt.attendeesCount || 0) / (evt.maxSeats || 100)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <EventStatusBadge status={evt.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Direct public link */}
                        <Link
                          to={`/events/${evt.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View public event page"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Approve & Publish (if Draft) */}
                        {evt.status === 'DRAFT' && (
                          <button
                            onClick={() => updateEventStatus(evt.id, 'PUBLISHED')}
                            title="Approve and Publish Event"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        )}

                        {/* Cancel Event (if Published) */}
                        {evt.status === 'PUBLISHED' && (
                          <button
                            onClick={() => updateEventStatus(evt.id, 'CANCELLED')}
                            title="Cancel Event"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reactivate Event (if Cancelled) */}
                        {evt.status === 'CANCELLED' && (
                          <button
                            onClick={() => updateEventStatus(evt.id, 'PUBLISHED')}
                            title="Reactivate Event"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Permanent Delete */}
                        <button
                          onClick={() => setEventToDelete(evt)}
                          title="Delete Event Permanently"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="py-3 px-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredEvents.length} of {events.length} campus events</span>
          <span className="text-slate-400">Master Institutional Catalog</span>
        </div>
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Event From Platform"
        description={`Are you sure you want to permanently delete "${eventToDelete?.title}"? All registered student tickets associated with this event will be cancelled.`}
        confirmLabel="Delete Event"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
