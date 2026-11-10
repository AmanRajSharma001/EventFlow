import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/public/LandingPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailsPage from './pages/public/EventDetailsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import Button from './components/common/Button';
import { ArrowLeft, Construction } from 'lucide-react';
import EmptyState from './components/common/EmptyState';

function RouteScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    let targetId = hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      // Keep malformed percent-encoded hashes from interrupting route rendering.
    }

    const animationFrame = requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(targetId)?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [pathname, hash]);

  return null;
}

function EventsRoute() {
  const { search } = useLocation();
  return <EventsPage key={search} />;
}

function PagePlaceholder({ title, description }) {
  return (
    <div className="ef-container py-14 sm:py-20">
      <EmptyState
        eyebrow="Page not found"
        title={title}
        description={description}
        icon={Construction}
        headingLevel={1}
        className="mx-auto max-w-2xl border-solid shadow-sm"
        action={(
          <Button as={Link} to="/" variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Home
          </Button>
        )}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteScrollManager />
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="events" element={<EventsRoute />} />
            <Route path="events/:id" element={<EventDetailsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="*"
              element={
                <PagePlaceholder
                  title="Page Not Found"
                  description="The page you are looking for does not exist in the EventFlow portal."
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
