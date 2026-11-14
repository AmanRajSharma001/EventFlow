import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Info,
  Search,
  Users,
} from 'lucide-react';
import { useOrganizer } from '../../hooks/useOrganizer';
import EventStatusBadge from '../../components/organizer/EventStatusBadge';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export default function OrganizerRegistrationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registrations } = useOrganizer();

  const currentEvent = events.find((e) => e.id === id) || events[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter registrations for this event
  const eventRegistrations = useMemo(() => {
    if (!currentEvent) return [];
    return registrations.filter((r) => r.eventId === currentEvent.id);
  }, [registrations, currentEvent]);

  const confirmedCount = eventRegistrations.filter((r) => r.status === 'Confirmed').length;
  const cancelledCount = eventRegistrations.filter((r) => r.status === 'Cancelled').length;

  const filteredList = useMemo(() => {
    return eventRegistrations.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.rollNumber.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [eventRegistrations, statusFilter, searchQuery]);

  // Export CSV without external libraries
  const handleExportCSV = () => {
    if (!filteredList.length) return;

    const headers = ['Student Name', 'Roll Number', 'Email', 'Department', 'Semester', 'Registered Date', 'Status'];
    const rows = filteredList.map((r) => [
      `"${r.studentName}"`,
      `"${r.rollNumber}"`,
      `"${r.email}"`,
      `"${r.department}"`,
      `"${r.semester}"`,
      `"${r.registeredAt}"`,
      `"${r.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentEvent.id}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!currentEvent) {
    return (
      <EmptyState
        icon={Users}
        title="No Event Selected"
        description="Please select an event to review student registrations."
        action={
          <Button as={Link} to="/organizer/events" size="sm">
            View All Events
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header & Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <EventStatusBadge status={currentEvent.status} />
            <span className="text-xs font-semibold text-slate-500">
              {currentEvent.category}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {currentEvent.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>{currentEvent.date}</span> · <span>{currentEvent.venue}</span>
          </p>
        </div>

        {/* Switch Event Dropdown & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={currentEvent.id}
            onChange={(e) => navigate(`/organizer/events/${e.target.value}/registrations`)}
            className="ef-input text-xs w-auto max-w-xs"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Demo Data Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 leading-relaxed">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <strong className="font-semibold text-blue-950">Simulated Participant Records:</strong> The registrations listed below are authentic sample college student profiles stored in frontend mock state.
        </div>
      </div>

      {/* Summary KPI Chips */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Enrolled
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-950">
            {eventRegistrations.length}
          </p>
          <p className="text-[11px] text-slate-400">Total applications received</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmed Participants
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {confirmedCount}
          </p>
          <p className="text-[11px] text-slate-400">Active tickets issued</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cancelled Seats
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-500">
            {cancelledCount}
          </p>
          <p className="text-[11px] text-slate-400">Seats returned to pool</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {['ALL', 'Confirmed', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by student, roll number, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ef-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Registrations Table */}
      {filteredList.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Student</th>
                  <th scope="col" className="px-6 py-3.5">Roll Number</th>
                  <th scope="col" className="px-6 py-3.5">Department &amp; Semester</th>
                  <th scope="col" className="px-6 py-3.5">Registration Time</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((reg) => (
                  <tr key={reg.id} className="transition hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">
                        {reg.studentName}
                      </div>
                      <div className="text-xs text-slate-500">{reg.email}</div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                      {reg.rollNumber}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium text-slate-900">{reg.department}</div>
                      <div className="text-slate-500">{reg.semester}</div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {reg.registeredAt}
                    </td>

                    <td className="px-6 py-4">
                      {reg.status === 'Confirmed' ? (
                        <Badge variant="success">Confirmed</Badge>
                      ) : (
                        <Badge variant="red">Cancelled</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No registrations found"
          description={
            searchQuery
              ? `No registrations matched "${searchQuery}".`
              : 'There are currently no registrations under this filter.'
          }
        />
      )}
    </div>
  );
}
