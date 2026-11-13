import { useEffect } from 'react';
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
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ticket) return null;

  const handlePrint = () => window.print();
  const isDemo = ticket.isDemo;
  const qrUnavailable = ticket.qrStatus === 'unavailable';
  const qrExpired = ticket.qrStatus === 'expired';
  const qrLoading = ticket.qrStatus === 'loading';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs print:hidden" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print:m-0 print:w-full print:max-w-none print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Ticket className="h-4 w-4 text-blue-600" />
            <span>{isDemo ? 'Campus E-Pass · Preview' : 'Campus E-Pass · Verified'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button type="button" variant="secondary" size="xs" icon={Printer} onClick={handlePrint}>
              Print Ticket
            </Button>
            <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blue">{ticket.eventCategory || 'Technical'}</Badge>
                <Badge variant={isDemo ? 'amber' : 'success'}>
                  {isDemo ? 'Demo ticket' : 'Confirmed entry'}
                </Badge>
              </div>
              <h2 id="ticket-modal-title" className="mt-3 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                {ticket.eventTitle}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Organized by <strong className="font-semibold text-slate-700">{ticket.organizer}</strong>
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ticket Pass ID</span>
              <span className="mt-0.5 inline-block font-mono text-base font-bold text-blue-600 sm:text-lg">{ticket.ticketNumber}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
            <dl className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Date &amp; Schedule</dt><dd className="font-medium text-slate-900">{ticket.date}</dd></div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Time</dt><dd className="font-medium text-slate-900">{ticket.time}</dd></div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Venue &amp; Entry Gate</dt><dd className="font-medium text-slate-900">{ticket.venue}</dd><dd className="text-xs font-medium text-blue-600">{ticket.gate}</dd></div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Student Attendee</dt><dd className="font-medium text-slate-900">{ticket.studentName}</dd><dd className="text-xs text-slate-500">Roll: <strong className="font-mono text-slate-700">{ticket.rollNumber || 'Not provided'}</strong> · {ticket.department || 'Not provided'}</dd></div>
              </div>
            </dl>

            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
              {isDemo ? (
                <>
                  <div className="grid h-36 w-36 place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-2 shadow-xs">
                    <QrCode className="h-24 w-24 text-slate-700" aria-label="Demo ticket QR placeholder" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>DEMO ONLY</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">Not valid for live entry verification</p>
                </>
              ) : qrLoading ? (
                <p className="text-sm font-medium text-slate-600">Loading secure QR data...</p>
              ) : qrUnavailable ? (
                <p className="text-sm font-medium text-red-600">QR data is unavailable.</p>
              ) : qrExpired ? (
                <p className="text-sm font-medium text-amber-700">This QR ticket has expired.</p>
              ) : (
                <>
                  <QrCode className="h-10 w-10 text-blue-600" aria-hidden="true" />
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Backend QR data</p>
                  <code className="mt-2 max-w-full break-all rounded bg-white px-2 py-1 text-[10px] text-slate-700">{ticket.qrToken}</code>
                  <p className="mt-2 text-[10px] text-slate-400">Present this backend-issued token at the checkpoint</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
              EventFlow Campus Pass · Carry student ID card
            </span>
            <span className="font-mono text-[11px] text-blue-700">{isDemo ? 'Preview session' : 'Live registration'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
