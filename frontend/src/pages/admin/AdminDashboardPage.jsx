import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Megaphone,
  Activity,
  ShieldCheck,
  Building,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import {
  calculateAdminMetrics,
  MOCK_USER_GROWTH_DATA,
} from '../../data/mockAdminData';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';

export default function AdminDashboardPage() {
  const {
    users,
    events,
    registrations,
    auditLog,
    dashboard,
    dashboardSource,
    isLoadingDashboard,
    dashboardError,
    refreshDashboard,
  } = useAdmin();
  const demoMetrics = calculateAdminMetrics(users, events, registrations);
  const metrics =
    dashboardSource === 'live' && dashboard
      ? {
          totalUsers: dashboard.users?.total ?? 0,
          totalStudents: dashboard.users?.students ?? 0,
          totalOrganizers: dashboard.users?.organizers ?? 0,
          totalEvents: dashboard.events?.total ?? 0,
          publishedEvents: dashboard.events?.published ?? 0,
          draftEvents: dashboard.events?.draft ?? 0,
          completedEvents: dashboard.events?.completed ?? 0,
          cancelledEvents: dashboard.events?.cancelled ?? 0,
          totalRegistrations: dashboard.participation?.totalRegistrations ?? 0,
          totalAttended: dashboard.participation?.totalAttendance ?? 0,
          overallAttendanceRate:
            dashboard.participation?.attendanceRatePercent ?? 0,
          activeStudents: null,
          activeOrganizers: null,
        }
      : demoMetrics;
  const [growthMetric, setGrowthMetric] = useState('students');

  useEffect(() => {
    if (dashboardSource === 'demo' && localStorage.getItem('eventflow_token')) {
      refreshDashboard();
    }
  }, [dashboardSource, refreshDashboard]);

  if (isLoadingDashboard) {
    return <LoadingState label="Loading admin analytics..." />;
  }

  if (dashboardSource === 'error') {
    return (
      <ErrorState
        title="Unable to load admin analytics"
        description={dashboardError}
        onRetry={refreshDashboard}
      />
    );
  }

  const statCards = [
    {
      label: 'Total Registered Users',
      value: metrics.totalUsers,
      sub: `${metrics.totalStudents} students · ${metrics.totalOrganizers} faculty/clubs`,
      icon: Users,
      trend: '+18% this month',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Active Students',
      value: metrics.totalStudents,
      sub:
        metrics.activeStudents == null
          ? 'Backend-reported student accounts'
          : `${metrics.activeStudents} active verified accounts`,
      icon: GraduationCap,
      trend: '+24 new this week',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Club & Faculty Organizers',
      value: metrics.totalOrganizers,
      sub:
        metrics.activeOrganizers == null
          ? 'Backend-reported organizer accounts'
          : `${metrics.activeOrganizers} active event creators`,
      icon: Briefcase,
      trend: '6 departments represented',
      color: 'text-violet-600 bg-violet-50 border-violet-100',
    },
    {
      label: 'Campus Events',
      value: metrics.totalEvents,
      sub: `${metrics.publishedEvents} published · ${metrics.draftEvents} draft · ${metrics.completedEvents} completed`,
      icon: Calendar,
      trend: `${metrics.publishedEvents} live now`,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Event Registrations',
      value: metrics.totalRegistrations,
      sub: 'Across all active events',
      icon: TrendingUp,
      trend: dashboardSource === 'live' ? 'Backend analytics' : '+84 registrations this week',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Campus Attendance Rate',
      value: `${metrics.overallAttendanceRate}%`,
      sub: `${metrics.totalAttended} total verified check-ins`,
      icon: CheckCircle2,
      trend: dashboardSource === 'live' ? 'Backend analytics' : 'High compliance rate',
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Superadmin Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform telemetry, user verification, and campus-wide event orchestration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/announcements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
          >
            <Megaphone className="w-4 h-4 text-blue-600" />
            Broadcast Alert
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            Manage Users
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">{card.sub}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">{card.trend}</span>
                <span className="text-slate-400">Platform status: Optimal</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Platform User Growth
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly verified registration trend across the university
              </p>
            </div>

            <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setGrowthMetric('students')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  growthMetric === 'students'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setGrowthMetric('organizers')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  growthMetric === 'organizers'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organizers
              </button>
            </div>
          </div>

          {dashboardSource === 'live' ? (
            <div className="flex h-56 items-center justify-center border-b border-slate-100 text-center text-sm text-slate-500">
              Historical user-growth data is not included in the live analytics response.
            </div>
          ) : (
            <>
              {/* Bar Chart Visualization */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 px-4 pb-2 border-b border-slate-100">
                {MOCK_USER_GROWTH_DATA.map((item, idx) => {
                  const val = growthMetric === 'students' ? item.students : item.organizers;
                  const maxVal = growthMetric === 'students' ? 1200 : 30;
                  const heightPct = Math.round((val / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[11px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-12 bg-blue-600 rounded-t-md hover:bg-blue-700 transition-all duration-300 relative group-hover:ring-2 ring-blue-200"
                      />
                      <span className="text-xs font-semibold text-slate-500 mt-2">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span>Aggregated across 7 engineering and science departments</span>
                <span className="font-semibold text-blue-600">+340% YoY Growth</span>
              </div>
            </>
          )}
        </div>

        {/* Quick System Distribution Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Event Lifecycle Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Current state of all campus event submissions
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Published & Active
                  </span>
                  <span className="font-semibold">{metrics.publishedEvents}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(metrics.publishedEvents / (metrics.totalEvents || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Completed
                  </span>
                  <span className="font-semibold">{metrics.completedEvents}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(metrics.completedEvents / (metrics.totalEvents || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pending Drafts
                  </span>
                  <span className="font-semibold">{metrics.draftEvents}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(metrics.draftEvents / (metrics.totalEvents || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Cancelled / Archived
                  </span>
                  <span className="font-semibold">{metrics.cancelledEvents}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${(metrics.cancelledEvents / (metrics.totalEvents || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/admin/events"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Open Event Review Pipeline
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Audit Log & Platform Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Audit Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Security & Administrative Audit Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable trace of admin status changes and publishing activity
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live audit active
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLog.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{log.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Quick Jump */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Direct Portals
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Navigate straight to department operations
            </p>

            <div className="space-y-2">
              <Link
                to="/admin/students"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Student Directory</p>
                    <p className="text-[11px] text-slate-500">Roll numbers, branch, activity</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/organizers"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-violet-50 text-violet-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Faculty & Clubs</p>
                    <p className="text-[11px] text-slate-500">Organizer credentials & leads</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/attendance"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Turnout Audit</p>
                    <p className="text-[11px] text-slate-500">Cross-department compliance</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              Superadmin privileges enabled. All account modifications and event approvals are registered immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
