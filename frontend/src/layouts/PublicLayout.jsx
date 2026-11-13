import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-blue-100 selection:text-blue-900">
      <a href="#main-content" className="sr-only z-[60] rounded-md bg-white px-4 py-2 font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-blue-500">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
