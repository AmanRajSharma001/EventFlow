import { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Building,
  Save,
  RotateCcw,
  CheckCircle,
  User,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import ConfirmationDialog from '../../components/student/ConfirmationDialog';
import toast from 'react-hot-toast';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { resetToDemo } = useAdmin();

  // Local editable fields
  const [name, setName] = useState(user?.name || 'Dr. Amitabh Sen');
  const [email] = useState(user?.email || 'admin@college.edu');
  const [phone, setPhone] = useState('+91 98765 00001');
  const [designation, setDesignation] = useState('Dean of Student Affairs & Chief Administrator');
  const [office, setOffice] = useState('Administrative Wing, Room 102');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Administrator profile preferences updated.');
  };

  const handleConfirmReset = () => {
    resetToDemo();
    setIsResetDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Superadmin Profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Administrative Identity & Security
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System privileges, institutional credentials, and platform reset controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs text-center">
            <div className="relative inline-block mx-auto mb-3">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 mx-auto"
              />
              <span className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white ring-2 ring-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{name}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{designation}</p>

            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              System Superadmin Role Active
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Office of Academic & Student Affairs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Institutional Tier 1 Clearance</span>
              </div>
            </div>
          </div>

          {/* Quick Privileges Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Assigned Permissions
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                User suspension & activation authorization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Event publication, cancellation & removal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Campus broadcast dispatch privileges
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Attendance compliance audits & export
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Editable Credentials & Maintenance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Administrative Profile Settings
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email (Read Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Contact Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Official Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Platform Maintenance & Demo State Reset */}
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-rose-700">
              <RotateCcw className="w-4 h-4" />
              <h2 className="text-base font-bold text-slate-900">
                Platform State Control
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Reset all local browser state (registered events, user statuses, and campus announcements) back to original institutional defaults.
            </p>

            <button
              onClick={() => setIsResetDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Platform State to Initial Demo Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Platform State to Defaults"
        description="Are you sure you want to reset all admin, organizer, and student storage keys to their initial demo data? Any unsaved local edits will be restored."
        confirmLabel="Reset All Data"
        cancelLabel="Keep Current State"
        isDestructive={true}
      />
    </div>
  );
}
