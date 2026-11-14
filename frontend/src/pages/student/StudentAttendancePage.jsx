import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  Info,
  MapPin,
  QrCode,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockCollegeEvents } from '../../data/mockEvents';
import { calculateStudentStats } from '../../data/mockStudentData';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/student/StatCard';

export default function StudentAttendancePage() {
  const {
    registeredEventIds = [],
    cancelledEventIds = [],
    attendanceRecords = [],
    attendanceSource,
    isLoadingAttendance,
    attendanceError,
    refreshAttendance,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');

  // Calculate statistics
  const stats = useMemo(() => {
    const demoStats = calculateStudentStats(
      registeredEventIds,
      cancelledEventIds,
      attendanceRecords
    );

    if (attendanceSource !== 'live') return demoStats;

    return {
      ...demoStats,
      attendedCount: attendanceRecords.length,
      attendanceRate: null,
      totalPoints: null,
    };
  }, [
    attendanceRecords,
    attendanceSource,
    cancelledEventIds,
    registeredEventIds,
  ]);

  const enrichedRecords = useMemo(() => {
    return attendanceRecords.map((rec) => {
      const event =
        rec.event || mockCollegeEvents.find((item) => item.id === rec.eventId);
      return {
        ...rec,
        eventTitle: rec.eventTitle || event?.title || 'Campus Event',
        category: event?.category || 'General',
        date: rec.date || event?.date || event?.startDate || 'Past Event',
        venue: event?.venue || 'Campus Auditorium',
        organizer: rec.organizer || event?.organizer || 'College Council',
      };
    });
  }, [attendanceRecords]);

  // Filter records by search
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return enrichedRecords;
    const q = searchQuery.toLowerCase();
    return enrichedRecords.filter(
      (r) =>
        r.eventTitle.toLowerCase().includes(q) ||
        r.venue.toLowerCase().includes(q) ||
        (r.verificationMethod || '').toLowerCase().includes(q)
    );
  }, [enrichedRecords, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            My Attendance &amp; Participation Records
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Official check-in logs, venue verifications, and student activity points.
          </p>
        </div>

        <Button
          as={Link}
          to="/events"
          variant="secondary"
          size="md"
          icon={Compass}
        >
          Explore More Events
        </Button>
      </div>

      {attendanceSource === 'demo' && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-blue-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <strong className="font-semibold text-blue-950">Campus Demo Records Notice:</strong>{' '}
            Attendance records are sample data stored in this browser because database integration is pending.
          </div>
        </div>
      )}

      {attendanceError && (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 text-sm text-red-800">
          <p>{attendanceError}</p>
          <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={refreshAttendance}>
            Retry attendance
          </Button>
        </div>
      )}

      {isLoadingAttendance && <p className="text-sm text-slate-500">Loading attendance records...</p>}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Attended Events"
          value={stats.attendedCount}
          subtitle="Check-in scanned & verified"
          icon={CheckCircle2}
          badgeText="Verified"
          badgeVariant="success"
        />
        <StatCard
          title="Attendance Rate"
          value={stats.attendanceRate == null ? '—' : `${stats.attendanceRate}%`}
          subtitle="Overall completion record"
          icon={GraduationCap}
          badgeText={stats.attendanceRate >= 85 ? 'High' : 'Normal'}
          badgeVariant="blue"
        />
        <StatCard
          title="Activity Points"
          value={stats.totalPoints == null ? '—' : `${stats.totalPoints} pts`}
          subtitle="Academic co-curricular score"
          icon={Sparkles}
          badgeText="+15 recent"
          badgeVariant="amber"
        />
        <StatCard
          title="Upcoming Registered"
          value={stats.upcomingCount}
          subtitle="Pending scheduled events"
          icon={Clock}
          badgeText="Scheduled"
          badgeVariant="neutral"
        />
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-bold text-slate-950">
          Attendance History ({filteredRecords.length})
        </h2>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ef-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Attendance Records Table */}
      {filteredRecords.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Event &amp; Category</th>
                  <th scope="col" className="px-6 py-3.5">Event Date &amp; Venue</th>
                  <th scope="col" className="px-6 py-3.5">Check-in Timestamp</th>
                  <th scope="col" className="px-6 py-3.5">Method</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-slate-50/60"
                  >
                    {/* Event & Category */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">
                        {record.eventTitle}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="blue" size="sm">
                          {record.category}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {record.organizer}
                        </span>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {record.date}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {record.venue}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-900">
                        {record.checkInTime}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {record.checkInLocation}
                      </div>
                    </td>

                    {/* Verification Method */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <QrCode className="h-3.5 w-3.5 text-blue-600" />
                        {record.verificationMethod}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {record.status}
                      </Badge>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-blue-600">
                      {record.pointsEarned == null ? '—' : `+${record.pointsEarned} pts`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="No attendance records found"
          description={
            searchQuery
              ? `No records matching "${searchQuery}". Try a different keyword.`
              : 'You have not attended any campus events yet.'
          }
          action={
            <Button as={Link} to="/events" size="sm" icon={Compass}>
              Discover Campus Events
            </Button>
          }
        />
      )}
    </div>
  );
}
