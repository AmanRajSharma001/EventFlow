import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import LoadingState from '../common/LoadingState';

export default function ProtectedRoute({ allowedRole = 'student', children }) {
  const { user, isAuthenticated, isRestoringSession, logout } = useAuth();
  const location = useLocation();

  if (isRestoringSession) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <LoadingState label="Verifying session credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    const roleLabel =
      allowedRole === 'admin'
        ? 'Central Campus Administration'
        : allowedRole === 'organizer'
        ? 'faculty and club organizers'
        : 'student participants';

    return (
      <div className="flex min-h-[75vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950 capitalize">
            {allowedRole} Access Only
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You are currently signed in as an <strong className="text-slate-900 capitalize">{user.role}</strong>. This portal is designated for {roleLabel}.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button as={Link} to="/" variant="secondary" icon={ArrowLeft}>
              Return to Homepage
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              icon={LogOut}
            >
              Sign out &amp; switch account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
