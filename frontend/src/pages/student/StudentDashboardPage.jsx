import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  Ticket,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockCollegeEvents } from '../../data/mockEvents';
import { calculateStudentStats, generateTicketData } from '../../data/mockStudentData';
import StatCard from '../../components/student/StatCard';
import TicketModal from '../../components/student/TicketModal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export default function StudentDashboardPage() {
  const {
    user,
    registeredEventIds = [],
    cancelledEventIds = [],
    activityItems = [],
    attendanceRecords = [],
  } = useAuth();

  const [selectedTicket, setSelectedTicket] = useState(null);

  // Compute student stats dynamically
  const stats = useMemo(() => {
    return calculateStudentStats(registeredEventIds, cancelledEventIds, attendanceRecords);
  }, [registeredEventIds, cancelledEventIds, attendanceRecords]);

  // Registered upcoming events
  const upcomingRegisteredEvents = useMemo(() => {
    return mockCollegeEvents.filter(
      (event) =>
        registeredEventIds.includes(event.id) &&
        !cancelledEventIds.includes(event.id) &&
        !event.isPast &&
        event.status !== 'Completed'
    );
  }, [registeredEventIds, cancelledEventIds]);

  // Recommended events (not registered, not past)
  const recommendedEvents = useMemo(() => {
    return mockCollegeEvents
      .filter(
        (event) =>
          !registeredEventIds.includes(event.id) &&
          !event.isPast &&
          event.status !== 'Completed'
      )
      .slice(0, 3);
  }, [registeredEventIds]);

  const handleOpenTicket = (event) => {
    const ticketData = generateTicketData(event, user);
    setSelectedTicket(ticketData);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'ticket':
        return <Ticket className="h-4 w-4 text-blue-600" />;
      case 'cancellation':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'attendance':
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 text-xs font-semibold text-blue-900">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Student Portal · {user?.department || 'Computer Science & Engineering'}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 max-w-xl">
              Here is what is happening with your campus activities, registered events, and attendance records.
            </p>
          </div>

          <div className="flex shrink-0 gap-2 sm:self-center">
            <Button
              as={Link}
              to="/events"
              variant="primary"
              size="md"
              icon={Compass}
            >
              Browse Campus Events
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section aria-label="Student Statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Registered Events"
            value={stats.totalRegistered}
            subtitle={`${stats.upcomingCount} upcoming · ${stats.attendedCount} completed`}
            icon={FileCheck2}
            badgeText="Live"
            badgeVariant="blue"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingCount}
            subtitle="Scheduled in campus calendar"
            icon={CalendarDays}
            badgeText="Active"
            badgeVariant="neutral"
          />
          <StatCard
            title="Events Attended"
            value={stats.attendedCount}
            subtitle={`${stats.totalPoints} campus points earned`}
            icon={GraduationCap}
            badgeText="Verified"
            badgeVariant="success"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            subtitle="Calculated across past enrollments"
            icon={TrendingUp}
            badgeText={stats.attendanceRate >= 80 ? 'Excellent' : 'Good'}
            badgeVariant={stats.attendanceRate >= 80 ? 'success' : 'amber'}
          />
        </div>
      </section>

      {/* Main Grid: Upcoming Registrations & Activity Feed */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Your Upcoming Events */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Your Upcoming Events
              </h2>
              <p className="text-xs text-slate-500">
                Events you are actively registered for
              </p>
            </div>
            <Link
              to="/student/registrations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all ({upcomingRegisteredEvents.length})
            </Link>
          </div>

          {upcomingRegisteredEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingRegisteredEvents.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 shadow-xs"
                >
                  <div className="relative h-44 sm:h-auto sm:w-48 shrink-0 bg-slate-100">
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3">
                      <Badge variant="blue">{event.category}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {event.organizer}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-slate-950 hover:text-blue-600 transition-colors">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {event.time}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <Badge variant="success">Confirmed Entry</Badge>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          icon={Ticket}
                          onClick={() => handleOpenTicket(event)}
                        >
                          View E-Pass
                        </Button>
                        <Button
                          as={Link}
                          to={`/events/${event.id}`}
                          variant="ghost"
                          size="xs"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming event registrations"
              description="You have not registered for any upcoming events yet. Explore open events across campus."
              className="py-10"
              action={
                <Button as={Link} to="/events" size="sm" icon={Compass}>
                  Find Events to Join
                </Button>
              }
            />
          )}
        </section>

        {/* Right Column: Recent Activity & Quick Stats */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-500">
                Audit trail of registrations &amp; attendance
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Demo session
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="space-y-4">
              {activityItems.slice(0, 5).map((item, index) => (
                <div key={item.id} className="relative flex items-start gap-3">
                  {index < activityItems.length - 1 && (
                    <span
                      className="absolute left-4 top-8 -bottom-4 w-px bg-slate-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-400 font-medium">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Events */}
          <div className="mt-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-950">
                  Recommended For You
                </h3>
                <p className="text-xs text-slate-500">
                  Popular upcoming activities in your branch
                </p>
              </div>
              <Link
                to="/events"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                All events
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {recommendedEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-slate-50/50"
                >
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {event.date} · {event.venue}
                    </p>
                  </div>
                  <Badge variant="blue" size="sm" className="shrink-0">
                    {event.category}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />
    </div>
  );
}
