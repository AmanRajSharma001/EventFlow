import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Info,
  QrCode,
  ScanLine,
  Search,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useOrganizer } from '../../hooks/useOrganizer';
import attendanceService from '../../services/attendance.service';
import registrationsService from '../../services/registrations.service';
import { adaptEventAttendanceRoster } from '../../services/adapters/attendanceAdapter';
import { isDatabasePendingError } from '../../services/dbStatus';
import EventStatusBadge from '../../components/organizer/EventStatusBadge';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/student/StatCard';

export default function OrganizerAttendancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, registrations, markAttendance } = useOrganizer();

  const currentEvent = events.find((e) => e.id === id) || events[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSource, setAttendanceSource] = useState('demo');
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const demoRecords = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.eventId === currentEvent?.id &&
          registration.status === 'Confirmed'
      ),
    [currentEvent?.id, registrations]
  );

  const refreshAttendance = useCallback(async () => {
    if (!currentEvent) return;

    const token = localStorage.getItem('eventflow_token');
    setAttendanceError(null);
    setFeedback(null);

    if (!token) {
      setAttendanceRecords(demoRecords);
      setAttendanceSource('demo');
      return;
    }

    setIsLoadingAttendance(true);
    try {
      const [rosterResponse, attendanceResponse] = await Promise.all([
        registrationsService.getEventRegistrations(currentEvent.id),
        attendanceService.getEventAttendance(currentEvent.id),
      ]);
      const roster = Array.isArray(rosterResponse)
        ? rosterResponse
        : rosterResponse.registrations || [];
      setAttendanceRecords(
        adaptEventAttendanceRoster(roster, attendanceResponse.attendees || [])
      );
      setAttendanceSource('live');
    } catch (error) {
      if (isDatabasePendingError(error)) {
        setAttendanceRecords(demoRecords);
        setAttendanceSource('demo');
      } else {
        setAttendanceRecords([]);
        setAttendanceSource('live');
        setAttendanceError(
          error?.response?.data?.message ||
            'Unable to load attendance records. Please try again.'
        );
      }
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [currentEvent, demoRecords]);

  useEffect(() => {
    const loadAttendance = async () => {
      await refreshAttendance();
    };
    loadAttendance();
  }, [refreshAttendance]);

  // Registrations for this event (only confirmed are eligible for attendance)
  const eventRegistrations = useMemo(() => {
    return attendanceRecords.filter((registration) => registration.status === 'Confirmed');
  }, [attendanceRecords]);

  const attendedCount = eventRegistrations.filter((r) => r.attendanceStatus === 'Present').length;
  const pendingCount = eventRegistrations.filter((r) => r.attendanceStatus === 'Pending' || !r.attendanceStatus).length;

  const attendanceRate = eventRegistrations.length > 0
    ? Math.round((attendedCount / eventRegistrations.length) * 100)
    : 0;

  const filteredStudents = useMemo(() => {
    return eventRegistrations.filter((r) => {
      const currentStatus = r.attendanceStatus || 'Pending';
      if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.rollNumber.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [eventRegistrations, statusFilter, searchQuery]);

  const handleSimulateScan = () => {
    if (attendanceSource !== 'demo') return;
    const nextPending = eventRegistrations.find(
      (r) => r.attendanceStatus === 'Pending' || !r.attendanceStatus
    );

    if (nextPending) {
      markAttendance(nextPending.id, 'Present');
      setLastScannedStudent(nextPending);
    } else if (eventRegistrations.length > 0) {
      // Pick first student to re-verify
      const first = eventRegistrations[0];
      markAttendance(first.id, 'Present');
      setLastScannedStudent(first);
    }
  };

  const handleQrCheckIn = async () => {
    if (!qrToken.trim() || isCheckingIn) return;
    setIsCheckingIn(true);
    setFeedback(null);

    try {
      if (attendanceSource === 'demo') {
        setFeedback({ type: 'error', message: 'QR verification requires a live backend connection.' });
        return;
      }

      const result = await attendanceService.checkInWithQr(
        qrToken.trim(),
        currentEvent.id
      );
      setFeedback({
        type: 'success',
        message: result?.message || 'Attendance recorded successfully.',
      });
      setQrToken('');
      await refreshAttendance();
    } catch (error) {
      if (isDatabasePendingError(error)) {
        setAttendanceSource('demo');
        setAttendanceRecords(demoRecords);
        setFeedback({
          type: 'info',
          message: 'Database integration is pending. Demo attendance is active.',
        });
      } else {
        setFeedback({
          type: 'error',
          message:
            error?.response?.data?.message ||
            'QR check-in failed. The ticket could not be verified.',
        });
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleManualCheckIn = async (student) => {
    if (student.attendanceStatus === 'Present' || isCheckingIn) return;
    setIsCheckingIn(true);
    setFeedback(null);

    try {
      if (attendanceSource === 'demo') {
        markAttendance(student.id, 'Present');
        setFeedback({ type: 'success', message: `Attendance marked for ${student.studentName}.` });
        return;
      }

      const result = await attendanceService.manualCheckIn(student.registrationId);
      setFeedback({
        type: 'success',
        message: result?.message || `Attendance marked for ${student.studentName}.`,
      });
      await refreshAttendance();
    } catch (error) {
      if (isDatabasePendingError(error)) {
        setAttendanceSource('demo');
        setAttendanceRecords(demoRecords);
        setFeedback({
          type: 'info',
          message: 'Database integration is pending. Demo attendance is active.',
        });
      } else {
        setFeedback({
          type: 'error',
          message:
            error?.response?.data?.message ||
            'Manual check-in failed. Please try again.',
        });
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (!currentEvent) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No Event Selected"
        description="Select an event to manage live check-in and attendance."
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
            Attendance Checkpoint: {currentEvent.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>{currentEvent.date}</span> · <span>{currentEvent.venue}</span>
          </p>
        </div>

        {/* Switch Event Dropdown & Scanner Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={currentEvent.id}
            onChange={(e) => navigate(`/organizer/events/${e.target.value}/attendance`)}
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
            variant={scannerActive ? 'primary' : 'secondary'}
            size="sm"
            icon={QrCode}
            onClick={() => setScannerActive(!scannerActive)}
          >
            {scannerActive ? 'Hide Scanner' : 'Open QR Scanner'}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-blue-900">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <strong className="font-semibold text-blue-950">
            {attendanceSource === 'live' ? 'Live QR verification:' : 'Demo attendance notice:'}
          </strong>{' '}
          {attendanceSource === 'live'
            ? 'QR tokens are verified by the backend. Invalid, expired, duplicate, and unauthorized responses are shown without changing local records.'
            : 'Database integration is pending, so check-ins use the existing local preview records.'}
        </div>
      </div>

      {attendanceError && (
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-800">
          <p>{attendanceError}</p>
          <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={refreshAttendance}>
            Retry attendance
          </Button>
        </div>
      )}

      {feedback && (
        <div className={`rounded-xl border p-4 text-sm ${
          feedback.type === 'success'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
            : feedback.type === 'info'
              ? 'border-blue-100 bg-blue-50 text-blue-800'
              : 'border-red-100 bg-red-50 text-red-800'
        }`}>
          {feedback.message}
        </div>
      )}

      {isLoadingAttendance && (
        <p className="text-sm text-slate-500">Loading attendance records...</p>
      )}

      {scannerActive && (
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Checkpoint Gate Scanner · {attendanceSource === 'live' ? 'Backend Verification' : 'Preview Simulator'}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold">
                Camera Viewfinder Simulation
              </h3>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={ScanLine}
              onClick={handleSimulateScan}
              disabled={attendanceSource !== 'demo' || isCheckingIn}
            >
              {attendanceSource === 'demo' ? 'Simulate Scan Next Ticket' : 'Camera scanner unavailable'}
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
              <label htmlFor="attendance-qr-token" className="text-xs font-semibold text-slate-300">
                Backend QR token
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="attendance-qr-token"
                  value={qrToken}
                  onChange={(event) => setQrToken(event.target.value)}
                  placeholder="Paste the attendee's backend-issued QR token"
                  disabled={attendanceSource !== 'live' || isCheckingIn}
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={ScanLine}
                  onClick={handleQrCheckIn}
                  disabled={attendanceSource !== 'live' || !qrToken.trim() || isCheckingIn}
                >
                  {isCheckingIn ? 'Verifying...' : 'Verify QR'}
                </Button>
              </div>
            </div>

            {/* Viewfinder Graphic */}
            <div className="relative mx-auto flex h-48 w-full max-w-sm flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-500/50 bg-slate-950/60 p-6 text-center">
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-blue-400 shadow-md shadow-blue-400 animate-bounce" />
              <QrCode className="h-16 w-16 text-slate-600" />
              <p className="mt-3 text-xs text-slate-400">
                {attendanceSource === 'live'
                  ? 'Use a camera integration or paste the backend token above.'
                  : 'Point simulated scanner at student mobile pass.'}
              </p>
            </div>

            {/* Scan Feedback Log */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs space-y-2.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Scanner Terminal Output
              </span>

              {lastScannedStudent ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    Verified &amp; Admitted!
                  </div>
                  <p className="mt-1 font-semibold text-white">
                    {lastScannedStudent.studentName}
                  </p>
                  <p className="font-mono text-[11px] text-slate-300">
                    Roll: {lastScannedStudent.rollNumber} · {lastScannedStudent.department}
                  </p>
                  <p className="mt-1 text-[10px] text-emerald-400 font-mono">
                    Check-in: {lastScannedStudent.checkInTime || 'Just now'} (Simulated)
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 py-4 text-center">
                  Awaiting scan trigger. Click &quot;Simulate Scan Next Ticket&quot; to test.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Eligible Students"
          value={eventRegistrations.length}
          subtitle="Confirmed participants"
          icon={Users}
          badgeText="Seats"
          badgeVariant="neutral"
        />
        <StatCard
          title="Marked Present"
          value={attendedCount}
          subtitle="Verified at checkpoint"
          icon={UserCheck}
          badgeText="Admitted"
          badgeVariant="success"
        />
        <StatCard
          title="Pending Check-in"
          value={pendingCount}
          subtitle="Awaiting gate arrival"
          icon={Clock}
          badgeText="Pending"
          badgeVariant="amber"
        />
        <StatCard
          title="Turnout Rate"
          value={`${attendanceRate}%`}
          subtitle="Attendance percentage"
          icon={CheckCircle2}
          badgeText={attendanceRate >= 80 ? 'High' : 'Normal'}
          badgeVariant="blue"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {['ALL', 'Present', 'Absent', 'Pending'].map((st) => (
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
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ef-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Attendance Roll Call Table */}
      {filteredStudents.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Student</th>
                  <th scope="col" className="px-6 py-3.5">Roll Number</th>
                  <th scope="col" className="px-6 py-3.5">Department</th>
                  <th scope="col" className="px-6 py-3.5">Gate Check-in Time</th>
                  <th scope="col" className="px-6 py-3.5">Current Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Manual Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const status = student.attendanceStatus || 'Pending';
                  return (
                    <tr key={student.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-950">
                          {student.studentName}
                        </div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                        {student.rollNumber}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {student.department}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-900">
                        {student.checkInTime || (
                          <span className="text-slate-400 font-normal">Not checked in</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {status === 'Present' && (
                          <Badge variant="success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Present
                          </Badge>
                        )}
                        {status === 'Absent' && (
                          <Badge variant="red">
                            <UserX className="mr-1 h-3 w-3" />
                            Absent
                          </Badge>
                        )}
                        {status === 'Pending' && (
                          <Badge variant="amber">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleManualCheckIn(student)}
                            disabled={status === 'Present' || isCheckingIn}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              status === 'Present'
                                ? 'cursor-not-allowed bg-emerald-600 text-white opacity-70'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          {attendanceSource === 'demo' && (
                            <button
                              type="button"
                              onClick={() => markAttendance(student.id, 'Absent')}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                status === 'Absent'
                                  ? 'bg-red-600 text-white'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-700'
                              }`}
                            >
                              Absent
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No attendance records found"
          description={
            searchQuery
              ? `No students matched "${searchQuery}".`
              : 'There are no students matching this filter.'
          }
        />
      )}
    </div>
  );
}
