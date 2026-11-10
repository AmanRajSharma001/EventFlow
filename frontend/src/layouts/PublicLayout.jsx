import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] selection:bg-slate-900 selection:text-white">
      <a href="#main-content" className="sr-only z-[60] rounded-md bg-white px-4 py-2 font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-indigo-500">
        Skip to main content
      </a>
      <Navbar />
      <div className="border-b border-indigo-100 bg-indigo-50/70" role="note">
        <div className="ef-container flex flex-col gap-1 py-2.5 text-xs sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
          <span className="shrink-0 font-bold text-indigo-900">Preview environment</span>
          <span className="text-indigo-900/75">Events, capacity figures, and registrations are sample data; actions are saved in this browser only.</span>
        </div>
      </div>
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
