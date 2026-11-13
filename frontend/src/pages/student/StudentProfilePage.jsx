import { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Info,
  Mail,
  Phone,
  RotateCcw,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import Badge from '../../components/common/Badge';

const departmentOptions = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology & Biomedical Engineering',
  'School of Business & Management',
];

const semesterOptions = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export default function StudentProfilePage() {
  const { user, updateStudentProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Demo Student',
    email: user?.email || 'student@example.com',
    rollNumber: user?.rollNumber || 'DEMO-001',
    department: user?.department || 'Computer Science & Engineering',
    semester: user?.semester || '6th Semester',
    phone: user?.phone || '+91 98765 43210',
    bio: user?.bio || 'Undergraduate student exploring hackathons, AI workshops, and university club activities.',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateStudentProfile(formData);
    setIsEditing(false);
  };

  const handleResetToDemo = () => {
    const demo = DEMO_ACCOUNTS.student;
    const restored = {
      name: demo.name,
      email: demo.email,
      rollNumber: demo.rollNumber,
      department: demo.department,
      semester: demo.semester,
      phone: '+91 98765 43210',
      bio: 'Undergraduate student exploring hackathons, AI workshops, and university club activities.',
    };
    setFormData(restored);
    updateStudentProfile(restored);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Student Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal academic details and campus credentials.
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
          <strong className="font-semibold text-blue-950">Local Browser Session Notice:</strong> Profile updates made here are saved to your browser’s local preview session. Changes will not be sent to a remote database until backend integration is connected.
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
            <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-950 truncate">
                {formData.name}
              </h2>
              <Badge variant="blue">Student</Badge>
              <Badge variant="success">Verified Campus ID</Badge>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {formData.department} · {formData.semester}
            </p>

            <p className="mt-2 text-xs font-mono font-semibold text-slate-500">
              Roll No: {formData.rollNumber}
            </p>
          </div>
        </div>

        {/* Profile Details Form / Display */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="student-name" label="Full Name" required>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="student-name"
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>

            <FormField id="student-roll" label="College Roll Number" required>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="student-roll"
                  type="text"
                  disabled={!isEditing}
                  value={formData.rollNumber}
                  onChange={(e) => handleChange('rollNumber', e.target.value.toUpperCase())}
                  className={`ef-input pl-10 font-mono uppercase ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="student-email" label="Institutional Email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="student-email"
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>

            <FormField id="student-phone" label="Contact Mobile">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="student-phone"
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="student-dept" label="Academic Department" required>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="student-dept"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField id="student-sem" label="Current Semester" required>
              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="student-sem"
                  disabled={!isEditing}
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  className={`ef-input pl-10 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                >
                  {semesterOptions.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
          </div>

          <FormField id="student-bio" label="Student Bio / Interests">
            <textarea
              id="student-bio"
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
                Save Profile Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Account Security Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-950">
          Account &amp; Security Settings
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Security controls and authentication mode.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
            <div>
              <p className="font-semibold text-slate-900">Authentication Mode</p>
              <p className="text-slate-500">Local Browser Session (Demo Mode)</p>
            </div>
            <Badge variant="blue">Local Demo</Badge>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
            <div>
              <p className="font-semibold text-slate-900">Two-Factor Authentication (2FA)</p>
              <p className="text-slate-500">Campus SSO integration planned for backend milestone</p>
            </div>
            <Badge variant="neutral">Planned</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
