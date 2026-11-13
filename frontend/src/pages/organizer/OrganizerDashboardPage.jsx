import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganizer } from '../../hooks/useOrganizer';
import { calculateOrganizerStats, getCategoryDistribution } from '../../data/mockOrganizerData';
import StatCard from '../../components/student/StatCard';
import EventStatusBadge from '../../components/organizer/EventStatusBadge';
import Button from '../../components/common/Button';

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const { events, registrations, activityItems } = useOrganizer();

  const stats = useMemo(() => {
    return calculateOrganizerStats(events, registrations);
  }, [events, registrations]);

  const categoryDistribution = useMemo(() => {
    return getCategoryDistribution(events);
  }, [events]);

  const recentEvents = useMemo(() => {
    return events.slice(0, 4);
  }, [events]);

  // Clean simulated weekly registration data for the visual analytics chart
  const weeklyTrend = [
    { week: 'W1 (Oct)', count: 24, height: '35%' },
    { week: 'W2 (Oct)', count: 42, height: '52%' },
    { week: 'W3 (Oct)', count: 68, height: '70%' },
    { week: 'W4 (Oct)', count: 55, height: '60%' },
    { week: 'W1 (Nov)', count: 88, height: '85%' },
    { week: 'W2 (Nov)', count: 120, height: '100%' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 text-xs font-semibold text-blue-900">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Organizer Administration Portal · {user?.department || 'Turing Computing Society'}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Welcome back, {user?.name || 'Faculty Organizer'}! 🎓
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 max-w-xl">
              Monitor student engagement, seat availability, attendance checkpoints, and publish new campus events.
            </p>
          </div>

          <div className="flex shrink-0 gap-2.5 sm:self-center">
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
        </div>
      </section>

      {/* Metrics Row */}
      <section aria-label="Organizer Statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            subtitle={`${stats.publishedEvents} active · ${stats.draftEvents} drafts`}
            icon={CalendarDays}
            badgeText="All Time"
            badgeVariant="neutral"
          />
          <StatCard
            title="Published Events"
            value={stats.publishedEvents}
            subtitle="Live & visible in student catalog"
            icon={TrendingUp}
            badgeText="Live"
            badgeVariant="blue"
          />
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            subtitle="Confirmed participants across events"
            icon={Users}
            badgeText="+14 this week"
            badgeVariant="success"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            subtitle="Scheduled in campus calendar"
            icon={CheckCircle2}
            badgeText="Ready"
            badgeVariant="neutral"
          />
        </div>
      </section>

      {/* Analytics Section */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Registration Velocity Chart (SVG/CSS Bar Graph) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Registration Velocity (Last 6 Weeks)
              </h2>
              <p className="text-xs text-slate-500">
                Enrolled students over recent schedule cycles
              </p>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-semibold text-slate-600">
              Demo Analytics
            </span>
          </div>

          {/* SVG/CSS Bar Chart visualization */}
          <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
            {weeklyTrend.map((item) => (
              <div key={item.week} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                {/* Tooltip on hover */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {item.count} regs
                </span>
                <div
                  className="w-full max-w-[2.5rem] rounded-t-lg bg-blue-600 transition-all duration-300 group-hover:bg-blue-700"
                  style={{ height: item.height }}
                />
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="mt-2.5 flex justify-between gap-2 text-[11px] font-medium text-slate-500">
            {weeklyTrend.map((item) => (
              <span key={item.week} className="flex-1 text-center truncate">
                {item.week}
              </span>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Overall Fill Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-950">
              Event Category Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Active campus engagement by domain
            </p>
          </div>

          <div className="space-y-3.5">
            {categoryDistribution.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.category}</span>
                  <span className="text-slate-500 font-medium">
                    {item.count} events ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-950 flex items-center justify-between">
            <div>
              <span className="block font-semibold">Overall Capacity Fill Rate</span>
              <span className="text-[11px] text-blue-800">Across all published seats</span>
            </div>
            <span className="text-lg font-bold font-mono text-blue-600">88.4%</span>
          </div>
        </div>
      </section>

      {/* Main Bottom Grid: Managed Events & Live Audit Log */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Managed Events Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Managed Events Performance
              </h2>
              <p className="text-xs text-slate-500">
                Quick status &amp; participant tracking
              </p>
            </div>
            <Link
              to="/organizer/events"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all ({events.length}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentEvents.map((evt) => {
              const capacityPercent = Math.min(
                100,
                Math.round(((evt.attendeesCount || 0) / (evt.maxSeats || 100)) * 100)
              );

              return (
                <article
                  key={evt.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <EventStatusBadge status={evt.status} />
                        <span className="text-xs font-semibold text-slate-500">
                          {evt.category}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-slate-950 truncate">
                        <Link
                          to={`/organizer/events/${evt.id}/registrations`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {evt.title}
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {evt.date} · {evt.venue}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
                        variant="ghost"
                        size="xs"
                        icon={UserCheck}
                      >
                        Attendance
                      </Button>
                    </div>
                  </div>

                  {/* Seat fill progress bar */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">
                        Enrollment: <strong className="text-slate-900">{evt.attendeesCount || 0}</strong> / {evt.maxSeats} seats
                      </span>
                      <span className="font-semibold text-blue-600">
                        {capacityPercent}% filled
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Live Organizer Audit Log */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Recent Activity Log
              </h2>
              <p className="text-xs text-slate-500">
                Audit trail of campus administrative actions
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Live Mock State
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
                    {item.type === 'registration' && <Users className="h-4 w-4 text-emerald-600" />}
                    {item.type === 'event' && <CalendarDays className="h-4 w-4 text-blue-600" />}
                    {item.type === 'announcement' && <Megaphone className="h-4 w-4 text-amber-600" />}
                    {item.type === 'attendance' && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
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
        </section>
      </div>
    </div>
  );
}
