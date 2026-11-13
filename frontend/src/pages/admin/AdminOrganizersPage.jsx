import { useMemo, useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Ban,
  Calendar,
  Building,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import UserStatusBadge from '../../components/admin/UserStatusBadge';
import UserDetailModal from '../../components/admin/UserDetailModal';
import toast from 'react-hot-toast';

export default function AdminOrganizersPage() {
  const { users, events, updateUserStatus } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter only organizers
  const organizerUsers = useMemo(() => {
    return users.filter((u) => u.role === 'organizer');
  }, [users]);

  // Compute event counts per organizer
  const organizersWithEventCounts = useMemo(() => {
    return organizerUsers.map((org) => {
      const orgEvents = events.filter(
        (e) => e.organizerId === org.id || e.organizer?.name === org.name
      );
      return {
        ...org,
        eventsHosted: orgEvents.length || org.eventsCreatedCount || 0,
      };
    });
  }, [organizerUsers, events]);

  // Filtered list
  const filteredOrganizers = useMemo(() => {
    return organizersWithEventCounts.filter((org) => {
      if (statusFilter !== 'ALL' && org.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          org.name.toLowerCase().includes(q) ||
          org.email.toLowerCase().includes(q) ||
          (org.department || '').toLowerCase().includes(q) ||
          (org.designation || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [organizersWithEventCounts, statusFilter, searchQuery]);

  // Metrics
  const activeCount = organizerUsers.filter((o) => o.status === 'Active').length;
  const pendingCount = organizerUsers.filter((o) => o.status === 'Pending').length;
  const totalEventsSum = organizersWithEventCounts.reduce(
    (acc, o) => acc + (o.eventsHosted || 0),
    0
  );

  const handleExportCSV = () => {
    const headers = ['Name,Email,Department,Designation,EventsHosted,Status,JoinedDate'];
    const rows = filteredOrganizers.map((o) =>
      [
        `"${o.name}"`,
        `"${o.email}"`,
        `"${o.department || 'N/A'}"`,
        `"${o.designation || 'N/A'}"`,
        o.eventsHosted || 0,
        `"${o.status}"`,
        `"${o.joinedDate || 'N/A'}"`,
      ].join(',')
    );

    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventflow-organizers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredOrganizers.length} organizer records.`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100 mb-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            Faculty Coordinators & Student Clubs
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Event Organizers Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervise approved club leads, department faculty coordinators, and publication rights.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Organizers
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Organizers
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{organizerUsers.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Clubs & departments</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Authorized
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Publishing privileges on</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Approval
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Under faculty review</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Events Hosted
          </p>
          <p className="text-2xl font-bold text-violet-600 mt-1">{totalEventsSum}</p>
          <p className="text-xs text-slate-400 mt-0.5">Organized on platform</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by organizer name, club, or department..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active Organizers</option>
            <option value="Pending">Pending Review</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Organizers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Organizer</th>
                <th className="py-3 px-4">Affiliated Club / Dept</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Events Created</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrganizers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No organizer profiles found</p>
                    <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms</p>
                  </td>
                </tr>
              ) : (
                filteredOrganizers.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={org.avatar}
                          alt={org.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{org.name}</p>
                          <p className="text-xs text-slate-500">{org.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department / Club */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {org.department || 'General Campus'}
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {org.designation || 'Club Coordinator'}
                    </td>

                    {/* Events created */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-violet-600" />
                        {org.eventsHosted} events
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <UserStatusBadge status={org.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(org)}
                          title="Inspect organizer"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {org.status === 'Active' ? (
                          <button
                            onClick={() => updateUserStatus(org.id, 'Suspended')}
                            title="Suspend privileges"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(org.id, 'Active')}
                            title="Approve / Activate"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="py-3 px-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredOrganizers.length} of {organizerUsers.length} total organizers</span>
          <span className="text-slate-400">Institutional Clubs & Committees</span>
        </div>
      </div>

      {/* Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusChange={updateUserStatus}
        />
      )}
    </div>
  );
}
