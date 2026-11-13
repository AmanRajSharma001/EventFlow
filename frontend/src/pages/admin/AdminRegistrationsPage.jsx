import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import toast from 'react-hot-toast';

export default function AdminRegistrationsPage() {
  const { registrations, events } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (eventFilter !== 'ALL' && reg.eventId !== eventFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && reg.status !== statusFilter) {
        return false;
      }
      if (attendanceFilter !== 'ALL' && reg.attendanceStatus !== attendanceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (reg.studentName || '').toLowerCase().includes(q) ||
          (reg.studentEmail || '').toLowerCase().includes(q) ||
          (reg.studentRoll || '').toLowerCase().includes(q) ||
          (reg.eventTitle || '').toLowerCase().includes(q) ||
          (reg.ticketId || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registrations, eventFilter, statusFilter, attendanceFilter, searchQuery]);

  // Metrics
  const totalCount = registrations.length;
  const confirmedCount = registrations.filter((r) => r.status === 'Confirmed').length;
  const attendedCount = registrations.filter((r) => r.attendanceStatus === 'Present').length;
  const cancelledCount = registrations.filter((r) => r.status === 'Cancelled').length;

  const handleExportCSV = () => {
    const headers = [
      'TicketId,StudentName,StudentEmail,RollNumber,EventTitle,RegisteredAt,Status,Attendance',
    ];
    const rows = filteredRegistrations.map((r) =>
      [
        `"${r.ticketId || r.id}"`,
        `"${r.studentName}"`,
        `"${r.studentEmail}"`,
        `"${r.studentRoll || 'N/A'}"`,
        `"${r.eventTitle}"`,
        `"${r.registeredAt}"`,
        `"${r.status}"`,
        `"${r.attendanceStatus || 'Absent'}"`,
      ].join(',')
    );

    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventflow-registrations-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredRegistrations.length} registrations.`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            University Central Ticket Database
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Registration Master Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit student registration tickets, seat allocations, and confirmation logs across the institution.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Registrations CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Tickets Issued
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Across all events</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmed Bookings
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{confirmedCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Valid entry tickets</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Check-Ins
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{attendedCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Scanned at venues</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cancelled Bookings
          </p>
          <p className="text-2xl font-bold text-slate-500 mt-1">{cancelledCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Released seats</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, roll number, event title, or ticket ID..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 max-w-xs"
          >
            <option value="ALL">All Events</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Attendance Filter */}
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">All Attendance</option>
            <option value="Present">Present (Checked In)</option>
            <option value="Absent">Absent / Pending</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Booking Status</th>
                <th className="py-3 px-4 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No registrations found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting the event or status filters</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Ticket ID */}
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {reg.ticketId || reg.id}
                      </span>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-100">
                          {reg.studentName ? reg.studentName.charAt(0) : 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{reg.studentName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{reg.studentRoll || 'CS-2023-042'}</span>
                            <span>·</span>
                            <span>{reg.studentEmail}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Event */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                      {reg.eventTitle}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {reg.registeredAt}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {reg.status === 'Confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3 h-3" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3" />
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4 text-right">
                      {reg.attendanceStatus === 'Present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <CheckCircle className="w-3 h-3" />
                          Present
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Absent / Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="py-3 px-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredRegistrations.length} of {registrations.length} ticket records</span>
          <span className="text-slate-400">Institutional Event Attendance Log</span>
        </div>
      </div>
    </div>
  );
}
