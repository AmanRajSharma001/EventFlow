import { useEffect } from 'react';
import {
  Building2,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import UserStatusBadge from './UserStatusBadge';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function UserDetailModal({ isOpen, onClose, user, onStatusChange }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal User Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="user-modal-title"
                className="text-lg font-bold text-slate-950 truncate"
              >
                {user.name}
              </h2>
              <UserStatusBadge status={user.status} />
              <Badge variant="blue" size="sm">
                {user.role}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-mono">
              ID: {user.id}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-5 space-y-3.5 text-xs">
          <div className="flex items-start gap-2.5">
            <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block">Email Address</span>
              <span className="font-semibold text-slate-900">{user.email}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block">Department / Society</span>
              <span className="font-semibold text-slate-900">{user.department}</span>
            </div>
          </div>

          {user.rollNumber && (
            <div className="flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Roll Number</span>
                <span className="font-mono font-semibold text-slate-900">{user.rollNumber}</span>
              </div>
            </div>
          )}

          {user.semester && (
            <div className="flex items-start gap-2.5">
              <GraduationCap className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Current Academic Semester</span>
                <span className="font-semibold text-slate-900">{user.semester}</span>
              </div>
            </div>
          )}

          {user.phone && (
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Contact Phone</span>
                <span className="font-semibold text-slate-900">{user.phone}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <CalendarDays className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block">Platform Registration Date</span>
              <span className="font-semibold text-slate-900">{user.joinedDate || '2025-08-15'}</span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2">
            {user.status !== 'Active' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={UserCheck}
                onClick={() => {
                  onStatusChange(user.id, 'Active');
                  onClose();
                }}
              >
                Activate Account
              </Button>
            )}

            {user.status !== 'Suspended' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={UserX}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  onStatusChange(user.id, 'Suspended');
                  onClose();
                }}
              >
                Suspend Account
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
