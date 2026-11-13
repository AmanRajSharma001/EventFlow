import { useEffect, useRef } from 'react';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Printer,
  QrCode,
  Sparkles,
  Ticket,
  User,
  X,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function TicketModal({ isOpen, onClose, ticket }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Ticket Container */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print:m-0 print:w-full print:max-w-none print:border-none print:shadow-none">
        {/* Modal Action Header (hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Ticket className="h-4 w-4 text-blue-600" />
            <span>Campus E-Pass · Preview Verification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="xs"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Ticket
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* The Printable Ticket Card */}
        <div ref={cardRef} className="p-6 sm:p-8">
          {/* Top Ticket Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blue">{ticket.eventCategory || 'Technical'}</Badge>
                <Badge variant="success">Confirmed Entry</Badge>
              </div>
              <h2
                id="ticket-modal-title"
                className="mt-3 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
              >
                {ticket.eventTitle}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Organized by <strong className="font-semibold text-slate-700">{ticket.organizer}</strong>
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Ticket Pass ID
              </span>
              <span className="mt-0.5 inline-block font-mono text-base font-bold text-blue-600 sm:text-lg">
                {ticket.ticketNumber}
              </span>
            </div>
          </div>

          {/* Ticket Body: Details & QR visual */}
          <div className="mt-6 grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
            {/* Left metadata */}
            <dl className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Date &amp; Schedule</dt>
                  <dd className="font-medium text-slate-900">{ticket.date}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Time</dt>
                  <dd className="font-medium text-slate-900">{ticket.time}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Venue &amp; Entry Gate</dt>
                  <dd className="font-medium text-slate-900">{ticket.venue}</dd>
                  <dd className="text-xs text-blue-600 font-medium">{ticket.gate}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Student Attendee</dt>
                  <dd className="font-medium text-slate-900">{ticket.studentName}</dd>
                  <dd className="text-xs text-slate-500">
                    Roll: <strong className="font-mono text-slate-700">{ticket.rollNumber}</strong> · {ticket.department}
                  </dd>
                </div>
              </div>
            </dl>

            {/* Right QR placeholder */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
              <div className="relative grid h-36 w-36 place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-2 shadow-xs">
                {/* Clean geometric QR visualization */}
                <svg
                  className="h-full w-full text-slate-900"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  aria-label="QR Code Demo Representation"
                >
                  {/* Top-left corner box */}
                  <rect x="5" y="5" width="28" height="28" fill="currentColor" rx="2" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="1" />
                  <rect x="13" y="13" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Top-right corner box */}
                  <rect x="67" y="5" width="28" height="28" fill="currentColor" rx="2" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="1" />
                  <rect x="75" y="13" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Bottom-left corner box */}
                  <rect x="5" y="67" width="28" height="28" fill="currentColor" rx="2" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="1" />
                  <rect x="13" y="75" width="12" height="12" fill="currentColor" rx="1" />

                  {/* Center & alignment data bits */}
                  <rect x="42" y="10" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="24" width="8" height="8" fill="currentColor" />
                  <rect x="54" y="18" width="8" height="8" fill="currentColor" />
                  <rect x="12" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="24" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="36" y="38" width="10" height="10" fill="currentColor" />
                  <rect x="50" y="40" width="12" height="12" fill="#2563EB" />
                  <rect x="68" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="80" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="66" width="8" height="8" fill="currentColor" />
                  <rect x="54" y="66" width="8" height="8" fill="currentColor" />
                  <rect x="68" y="68" width="8" height="8" fill="currentColor" />
                  <rect x="80" y="78" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="80" width="16" height="8" fill="currentColor" />
                </svg>
              </div>

              <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                <QrCode className="h-3.5 w-3.5 text-blue-600" />
                <span>DEMO SCAN TOKEN</span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Present at checkpoint for scanner check-in
              </p>
            </div>
          </div>

          {/* Ticket Footer Banner */}
          <div className="mt-6 flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              EventFlow Campus Pass · Carry student ID card
            </span>
            <span className="font-mono text-[11px] text-blue-700">
              {ticket.issuedAt}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
