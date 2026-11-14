import { useMemo, useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Ban,
  Calendar,
  Award,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import UserStatusBadge from '../../components/admin/UserStatusBadge';
import UserDetailModal from '../../components/admin/UserDetailModal';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
  const { users, updateUserStatus } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter only students
  const studentUsers = useMemo(() => {
    return users.filter((u) => u.role === 'student');
  }, [users]);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set();
    studentUsers.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [studentUsers]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return studentUsers.filter((s) => {
      if (deptFilter !== 'ALL' && s.department !== deptFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && s.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q) ||
          (s.department || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studentUsers, deptFilter, statusFilter, searchQuery]);

  // Metrics
  const activeCount = studentUsers.filter((s) => s.status === 'Active').length;
  const suspendedCount = studentUsers.filter((s) => s.status === 'Suspended').length;
  const totalRegistrations = studentUsers.reduce(
    (acc, s) => acc + (s.registeredEventsCount || 0),
    0
  );

  const handleExportCSV = () => {
    const headers = ['RollNumber,Name,Email,Department,Semester,Registrations,Attended,Status'];
    const rows = filteredStudents.map((s) =>
      [
        `"${s.rollNumber || 'N/A'}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.department || 'N/A'}"`,
        `"${s.semester || 'N/A'}"`,
        s.registeredEventsCount || 0,
        s.attendedCount || 0,
        `"${s.status}"`,
      ].join(',')
    );

    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `eventflow-students-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredStudents.length} student records.`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            Undergraduate & Postgraduate Roster
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Student Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student registrations, academic roll profiles, and attendance eligibility.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Student Roster
        </button>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Students
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{studentUsers.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Enrolled on platform</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Accounts
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Fully authorized</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Suspended
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{suspendedCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">Requires inquiry</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Registrations
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalRegistrations}</p>
          <p className="text-xs text-slate-400 mt-0.5">Event participations</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, roll number, email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Department & Sem</th>
                <th className="py-3 px-4">Registrations</th>
                <th className="py-3 px-4">Attended</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No student profiles match your search</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the department or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roll */}
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {student.rollNumber || 'N/A'}
                      </span>
                    </td>

                    {/* Department & Sem */}
                    <td className="py-3 px-4">
                      <p className="text-xs font-medium text-slate-800">{student.department}</p>
                      <p className="text-[11px] text-slate-400">{student.semester || 'Semester not set'}</p>
                    </td>

                    {/* Registrations count */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {student.registeredEventsCount || 0}
                      </span>
                    </td>

                    {/* Attended count */}
                    <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        {student.attendedCount || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <UserStatusBadge status={student.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(student)}
                          title="Inspect student profile"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {student.status === 'Active' ? (
                          <button
                            onClick={() => updateUserStatus(student.id, 'Suspended')}
                            title="Suspend student access"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(student.id, 'Active')}
                            title="Activate student account"
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
          <span>Showing {filteredStudents.length} of {studentUsers.length} enrolled students</span>
          <span className="text-slate-400">Academic Year 2026</span>
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
