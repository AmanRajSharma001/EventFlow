import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const handleFillDemo = (role) => {
    setActiveRole(role);
    setFormData({
      identifier: role === 'student' ? DEMO_ACCOUNTS.student.rollNumber : DEMO_ACCOUNTS.organizer.email,
      password: '',
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeRole === 'student') {
      login('student', {
        rollNumber: formData.identifier,
        email: formData.identifier.includes('@')
          ? formData.identifier
          : `${formData.identifier.trim().toLowerCase()}@college.edu`,
      });
    } else {
      login('organizer', { email: formData.identifier, name: 'Faculty / Club Organizer' });
    }

    navigate(location.state?.from || '/', { replace: true });
  };

  return (
    <div className="ef-container grid min-h-[70vh] items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.85fr)] lg:gap-16">
      <div className="hidden max-w-xl lg:block">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Your campus, connected</p>
        <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">Sign in to continue with EventFlow.</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">Use the local preview to explore the student and organizer entry points. Event registrations remain in this browser.</p>
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
          <p className="text-sm leading-6 text-slate-600">Backend authentication is not connected yet. This page creates a browser-only preview session.</p>
        </div>
      </div>

      <section className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white lg:hidden"><LockKeyhole aria-hidden="true" className="h-5 w-5" /></div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700 lg:mt-0">Preview sign-in</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose a role and enter any preview credentials to continue.</p>
        </div>

        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4" role="note">
          <p className="text-sm font-semibold text-indigo-950">Local demo mode</p>
          <p className="mt-1 text-xs leading-5 text-indigo-900/80">Credentials are not sent to a server or validated against an account.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="rounded-lg border border-indigo-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-800 transition-colors hover:border-indigo-400 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Fill student preview
              <span className="mt-0.5 block font-normal text-slate-500">{DEMO_ACCOUNTS.student.rollNumber}</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('organizer')}
              className="rounded-lg border border-indigo-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-800 transition-colors hover:border-indigo-400 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Fill organizer preview
              <span className="mt-0.5 block font-normal text-slate-500">{DEMO_ACCOUNTS.organizer.email}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="Choose sign-in role">
          {[
            { id: 'student', label: 'Student', Icon: GraduationCap },
            { id: 'organizer', label: 'Organizer', Icon: BriefcaseBusiness },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeRole === id}
              onClick={() => setActiveRole(id)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeRole === id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormField
            id="login-identifier"
            label={activeRole === 'student' ? 'College roll number or email' : 'Organizer email'}
            required
          >
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={(event) => setFormData({ ...formData, identifier: event.target.value })}
                placeholder={activeRole === 'student' ? 'e.g. DEMO-001' : 'name@college.edu'}
                className="ef-input pl-10"
              />
            </div>
          </FormField>

          <FormField id="login-password" label="Password" required>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="Enter a preview password"
                className="ef-input pl-10 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <Button type="submit" className="w-full" icon={ArrowRight} iconPosition="right">
            Continue as {activeRole === 'student' ? 'student' : 'organizer'}
          </Button>
        </form>

        {activeRole === 'student' && (
          <p className="mt-5 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
            New to EventFlow?{' '}
            <Link to="/register" className="rounded-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Create a preview account</Link>
          </p>
        )}
      </section>
    </div>
  );
}
