import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Compass,
  MapPin,
  QrCode,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockCollegeEvents } from '../../data/mockEvents';
import { generateTicketData } from '../../data/mockStudentData';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import TicketModal from '../../components/student/TicketModal';

export default function StudentTicketsPage() {
  const {
    user,
    registeredEventIds = [],
    cancelledEventIds = [],
  } = useAuth();

  const [activeTicket, setActiveTicket] = useState(null);

  // Generate ticket objects for all active registrations
  const tickets = useMemo(() => {
    return mockCollegeEvents
      .filter(
        (event) =>
          registeredEventIds.includes(event.id) &&
          !cancelledEventIds.includes(event.id)
      )
      .map((event) => generateTicketData(event, user));
  }, [registeredEventIds, cancelledEventIds, user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            My Event Passes &amp; Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Digital entry passes for your enrolled campus hackathons, workshops, and fests.
          </p>
        </div>

        <Button
          as={Link}
          to="/events"
          variant="primary"
          size="md"
          icon={Compass}
        >
          Explore More Events
        </Button>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs text-slate-600">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-slate-900">Digital Gate Pass:</strong> Show these passes on your mobile screen or bring a printed copy to event checkpoints for instant registration verification.
        </p>
      </div>

      {/* Tickets Grid */}
      {tickets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.ticketNumber}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md"
            >
              {/* Ticket Top Decorative Header */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {ticket.eventCategory}
                    </span>
                    <h2 className="mt-1 text-lg font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                      {ticket.eventTitle}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Host: {ticket.organizer}
                    </p>
                  </div>

                  <span className="rounded-md border border-blue-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-blue-600 shadow-xs">
                    {ticket.ticketNumber}
                  </span>
                </div>
              </div>

              {/* Ticket Content Body */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400 font-medium">Attendee</span>
                    <span className="mt-0.5 block font-semibold text-slate-900 truncate">
                      {ticket.studentName}
                    </span>
                    <span className="block text-slate-500 font-mono text-[11px]">
                      {ticket.rollNumber}
                    </span>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Department</span>
                    <span className="mt-0.5 block font-semibold text-slate-900 truncate">
                      {ticket.department}
                    </span>
                    <span className="block text-slate-500 text-[11px]">
                      {ticket.semester}
                    </span>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Date &amp; Time</span>
                    <span className="mt-0.5 flex items-center gap-1 font-semibold text-slate-900">
                      <CalendarDays className="h-3 w-3 text-slate-400 shrink-0" />
                      {ticket.date}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      {ticket.time}
                    </span>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-medium">Venue &amp; Gate</span>
                    <span className="mt-0.5 flex items-center gap-1 font-semibold text-slate-900 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      {ticket.venue}
                    </span>
                    <span className="mt-0.5 block font-medium text-blue-600 text-[11px]">
                      {ticket.gate}
                    </span>
                  </div>
                </div>

                {/* Perforated separator divider */}
                <div className="relative my-5 -mx-5 flex items-center">
                  <div className="h-4 w-4 rounded-r-full border-r border-t border-b border-slate-200 bg-slate-50" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <div className="h-4 w-4 rounded-l-full border-l border-t border-b border-slate-200 bg-slate-50" />
                </div>

                {/* Bottom Ticket QR snippet & Action */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-900">QR Encrypted Pass</span>
                      <span className="block text-[10px] text-slate-400">Scan at entrance</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={Ticket}
                      onClick={() => setActiveTicket(ticket)}
                    >
                      View &amp; Print Pass
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No event passes available"
          description="You do not have any active event passes. When you register for campus events, your verified tickets and QR checkpoints appear here."
          action={
            <Button as={Link} to="/events" size="sm" icon={Compass}>
              Find Events to Join
            </Button>
          }
        />
      )}

      {/* Ticket Modal */}
      <TicketModal
        isOpen={Boolean(activeTicket)}
        onClose={() => setActiveTicket(null)}
        ticket={activeTicket}
      />
    </div>
  );
}
