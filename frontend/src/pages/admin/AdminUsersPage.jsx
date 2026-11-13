import { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Ban,
  GraduationCap,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import UserStatusBadge from '../../components/admin/UserStatusBadge';
import UserDetailModal from '../../components/admin/UserDetailModal';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { users, updateUserStatus } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  // Counts for role tabs
  const counts = useMemo(() => {
    return {
      all: users.length,
      student: users.filter((u) => u.role === 'student').length,
      organizer: users.filter((u) => u.role === 'organizer').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role filter
      if (roleFilter !== 'ALL' && user.role !== roleFilter.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && user.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = user.name.toLowerCase().includes(q);
        const emailMatch = user.email.toLowerCase().includes(q);
        const deptMatch = (user.department || '').toLowerCase().includes(q);
        const rollMatch = (user.rollNumber || '').toLowerCase().includes(q);
        return nameMatch || emailMatch || deptMatch || rollMatch;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID,Name,Email,Role,Department,RollNumber,Status,JoinedDate'];
    const rows = filteredUsers.map((u) =>
      [
        `"${u.id}"`,
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.role}"`,
        `"${u.department || 'N/A'}"`,
        `"${u.rollNumber || 'N/A'}"`,
        `"${u.status}"`,
        `"${u.joinedDate || 'N/A'}"`,
      ].join(',')
    );

    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventflow-users-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredUsers.length} user records.`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case 'organizer':
        return <Briefcase className="w-3.5 h-3.5 text-violet-600" />;
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            All Users Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete institutional directory of students, faculty, and administrative personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            roleFilter === 'ALL'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Accounts ({counts.all})
        </button>
        <button
          onClick={() => setRoleFilter('STUDENT')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            roleFilter === 'STUDENT'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Students ({counts.student})
        </button>
        <button
          onClick={() => setRoleFilter('ORGANIZER')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            roleFilter === 'ORGANIZER'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Organizers ({counts.organizer})
        </button>
        <button
          onClick={() => setRoleFilter('ADMIN')}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            roleFilter === 'ADMIN'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Superadmins ({counts.admin})
        </button>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, roll number, or department..."
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
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Affiliation</th>
                <th className="py-3 px-4">Roll / Role Spec</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No users match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                      {user.department || user.designation || 'Institutional'}
                    </td>

                    {/* Roll / Specifics */}
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {user.rollNumber ? (
                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {user.rollNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <UserStatusBadge status={user.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="Inspect user details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {user.role !== 'admin' && (
                          <>
                            {user.status === 'Active' ? (
                              <button
                                onClick={() => updateUserStatus(user.id, 'Suspended')}
                                title="Suspend access"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(user.id, 'Active')}
                                title="Activate account"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="py-3 px-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredUsers.length} of {users.length} total users</span>
          <span className="text-slate-400">Institutional record v1.4</span>
        </div>
      </div>

      {/* Detail Modal */}
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
