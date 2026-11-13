import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import { useAuth } from '../../hooks/useAuth';

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology & Biomedical Engineering',
  'School of Business & Management',
];

const semesters = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester',
];

const emptyForm = {
  fullName: '',
  rollNumber: '',
  email: '',
  department: departments[0],
  semester: '1st Semester',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (field === 'password' || field === 'confirmPassword') setPasswordError('');
  };

  const handleDemoFill = () => {
    setFormData({
      fullName: 'Demo Student',
      rollNumber: 'DEMO-001',
      email: 'student@example.com',
      department: 'Information Technology',
      semester: '6th Semester',
      phone: '+91 98765 43210',
      password: 'password123',
      confirmPassword: 'password123',
    });
    setPasswordError('');
    toast.success('Sample details filled in the form.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match. Check both fields and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerStudent(formData);
      if (res?.success) {
        navigate('/student/dashboard', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ef-container grid min-h-[70vh] gap-8 py-10 sm:py-14 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-12">
      <aside className="lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Student preview account</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">Get started with your campus events.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">Create a local preview profile to explore the EventFlow student experience.</p>
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <p className="text-sm font-semibold text-blue-950">Backend Registration Notice</p>
          <p className="mt-1 text-xs leading-5 text-blue-900/80">
            Account registration submits your name, email, and password to the Express backend. Additional academic details (roll number, department, semester, phone) are saved to your browser session until the Prisma User schema is expanded.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={handleDemoFill}>
          Fill sample details
        </Button>
      </aside>

      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><GraduationCap aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Create a student profile</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">Fields marked with <span className="font-semibold text-rose-700">*</span> are required.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="full-name" label="Full name" required>
              <input id="full-name" name="fullName" type="text" autoComplete="name" required minLength={2} value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Your name" className="ef-input" />
            </FormField>
            <FormField id="roll-number" label="College roll number" required>
              <input id="roll-number" name="rollNumber" type="text" autoComplete="off" required value={formData.rollNumber} onChange={(event) => updateField('rollNumber', event.target.value.toUpperCase())} placeholder="e.g. DEMO-001" className="ef-input font-mono uppercase" />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="student-email" label="Email address" required>
              <input id="student-email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@college.edu" className="ef-input" />
            </FormField>
            <FormField id="student-phone" label="Mobile number" required>
              <input id="student-phone" name="phone" type="tel" autoComplete="tel" required value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Include country code if needed" className="ef-input" />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="student-department" label="Department" required>
              <select id="student-department" name="department" required value={formData.department} onChange={(event) => updateField('department', event.target.value)} className="ef-input">
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </FormField>
            <FormField id="student-semester" label="Current semester" required>
              <select id="student-semester" name="semester" required value={formData.semester} onChange={(event) => updateField('semester', event.target.value)} className="ef-input">
                {semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="new-password" label="Password" hint="Use at least 8 characters." required>
              <div className="relative">
                <input id="new-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} aria-describedby="new-password-hint" value={formData.password} onChange={(event) => updateField('password', event.target.value)} placeholder="At least 8 characters" className="ef-input pr-12" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
            <FormField id="confirm-password" label="Confirm password" error={passwordError} required>
              <div className="relative">
                <input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} aria-invalid={passwordError ? 'true' : undefined} aria-describedby={passwordError ? 'confirm-password-error' : undefined} value={formData.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} placeholder="Re-enter your password" className="ef-input pr-12" />
                <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  {showConfirmPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
            This is a local preview profile. Do not use a password you use for another account.
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            icon={ArrowRight}
            iconPosition="right"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
          Already have a preview profile?{' '}
          <Link to="/login" className="rounded-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
