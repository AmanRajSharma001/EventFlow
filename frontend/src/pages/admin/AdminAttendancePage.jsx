import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Search,
  Filter,
  Download,
  Building,
  Clock,
  Award,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import toast from 'react-hot-toast';

export default function AdminAttendancePage() {
  const { events, registrations } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Compute attendance stats per event
  const eventAttendanceList = useMemo(() => {
    return events.map((event) => {
      const eventRegs = registrations.filter((r) => r.eventId === event.id);
      const confirmedRegs = eventRegs.filter((r) => r.status === 'Confirmed');
      const presentCount = eventRegs.filter((r) => r.attendanceStatus === 'Present').length;
      const rate = confirmedRegs.length > 0
        ? Math.round((presentCount / confirmedRegs.length) * 100)
        : 0;

      return {
        id: event.id,
        title: event.title,
        department: event.department || 'Campus Department',
        date: event.startDate || 'Upcoming',
        totalRegistered: confirmedRegs.length,
        totalPresent: presentCount,
        rate,
        status: event.status,
      };
    });
  }, [events, registrations]);

  // Extract departments
  const departments = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [events]);

  // Filtered list
  const filteredEvents = useMemo(() => {
    return eventAttendanceList.filter((item) => {
      if (deptFilter !== 'ALL' && item.department !== deptFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eventAttendanceList, deptFilter, searchQuery]);

  // Platform totals
  const totalRegistrations = registrations.filter((r) => r.status === 'Confirmed').length;
  const totalAttended = registrations.filter((r) => r.attendanceStatus === 'Present').length;
  const overallRate = totalRegistrations > 0
    ? Math.round((totalAttended / totalRegistrations) * 100)
    : 0;

  const handleExportCSV = () => {
    const headers = ['EventTitle,Department,Date,Registrations,PresentCheckins,TurnoutRate'];
    const rows = filteredEvents.map((e) =>
      [
        `"${e.title}"`,
        `"${e.department}"`,
        `"${e.date}"`,
        e.totalRegistered,
        e.totalPresent,
        `"${e.rate}%"`,
      ].join(',')
    );

    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventflow-attendance-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance audit report exported.');
  };

  const getComplianceBadge = (rate) => {
    if (rate >= 75) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          High Turnout ({rate}%)
        </span>
      );
    }
    if (rate >= 40) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Moderate Turnout ({rate}%)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Low / Pending ({rate}%)
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Institutional Turnout & Credit Compliance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Attendance Audit & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official records of student event presence for academic credits and co-curricular certification.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Turnout
          </p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{overallRate}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Average across all events</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Check-Ins
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalAttended}</p>
          <p className="text-xs text-slate-400 mt-0.5">Scanned student passes</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmed Bookings
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalRegistrations}</p>
          <p className="text-xs text-slate-400 mt-0.5">Registered participants</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Events Audited
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{events.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Active event sessions</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event title or department..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Checked-In</th>
                <th className="py-3 px-4">Turnout Ratio</th>
                <th className="py-3 px-4 text-right">Compliance Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No event records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the department filter</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 text-xs">{item.title}</p>
                      <span className="text-[11px] text-slate-400 uppercase font-medium">
                        Status: {item.status}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {item.department}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.date}
                      </div>
                    </td>

                    {/* Registered */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                      {item.totalRegistered} seats
                    </td>

                    {/* Checked in */}
                    <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        {item.totalPresent} verified
                      </div>
                    </td>

                    {/* Turnout Ratio */}
                    <td className="py-3 px-4">
                      <div className="w-28">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span>{item.rate}%</span>
                          <span className="text-slate-400">
                            {item.totalPresent}/{item.totalRegistered || 1}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.rate >= 75
                                ? 'bg-emerald-500'
                                : item.rate >= 40
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Badge */}
                    <td className="py-3 px-4 text-right">
                      {getComplianceBadge(item.rate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="py-3 px-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredEvents.length} audited event sessions</span>
          <span className="text-slate-400">Institutional Accreditation Report</span>
        </div>
      </div>
    </div>
  );
}
