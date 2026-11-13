import { useState } from 'react';
import {
  Building2,
  Info,
  Mail,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Badge from '../../components/common/Badge';

export default function OrganizerProfilePage() {
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Faculty Organizer',
    email: user?.email || 'organizer@example.com',
    department: user?.department || 'Turing Computing Society / CSE Dept',
    phone: '+91 98765 01234',
    designation: 'Faculty Coordinator & Associate Professor',
    bio: 'Overseeing annual campus hackathons, technical conferences, and student project showcases across university departments.',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    login('organizer', {
      name: formData.name,
      email: formData.email,
      department: formData.department,
    });
    setIsEditing(false);
  };

  const handleResetToDemo = () => {
    const demo = DEMO_ACCOUNTS.organizer;
    const restored = {
      name: demo.name,
      email: demo.email,
      department: demo.department,
      phone: '+91 98765 01234',
      designation: 'Faculty Coordinator & Associate Professor',
      bio: 'Overseeing annual campus hackathons, technical conferences, and student project showcases across university departments.',
    };
    setFormData(restored);
    login('organizer', {
      name: demo.name,
      email: demo.email,
      department: demo.department,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Organizer &amp; Faculty Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Campus event manager credentials and department authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetToDemo}
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Local storage note banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 leading-relaxed">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <strong className="font-semibold text-blue-950">Local Browser Session Notice:</strong> Organizer profile changes are stored in your active browser session. No database changes are committed during this frontend development phase.
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-slate-100 pb-6">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-20 w-20 rounded-2xl border border-slate-200 object-cover shadow-xs"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-xs">
                {formData.name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full border-2 border-white bg-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-950 truncate">
                {formData.name}
              </h2>
              <Badge variant="blue">Organizer</Badge>
              <Badge variant="success">Event Administration Rights</Badge>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {formData.designation}
            </p>

            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              {formData.department}
            </p>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="org-name" label="Full Name" required>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="org-name"
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>

            <FormField id="org-email" label="Official Campus Email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="org-email"
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="org-dept" label="Affiliated Society / Department" required>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="org-dept"
                  type="text"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>

            <FormField id="org-phone" label="Department Contact Number">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="org-phone"
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>
          </div>

          <FormField id="org-bio" label="Organizer Bio &amp; Campus Responsibilities">
            <textarea
              id="org-bio"
              rows={3}
              disabled={!isEditing}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className={`ef-input ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
            />
          </FormField>

          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
              >
                Save Organizer Details
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Security & Access Rights Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-950">
          Organizer Role Privileges
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Current access capabilities granted to your account.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">Event Publishing Rights</span>
              <span className="text-slate-500">Authorized to create, edit, draft, and cancel campus events</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">Attendance Checkpoint Validation</span>
              <span className="text-slate-500">Authorized to operate simulated QR gate scanners and mark attendance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
