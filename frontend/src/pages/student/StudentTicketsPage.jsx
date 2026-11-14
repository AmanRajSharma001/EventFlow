import { useMemo, useRef, useState } from 'react';
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
import registrationsService from '../../services/registrations.service';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import TicketModal from '../../components/student/TicketModal';

function getDemoTickets(registeredEventIds, cancelledEventIds, user) {
  return mockCollegeEvents
    .filter(
      (event) =>
        registeredEventIds.includes(event.id) &&
        !cancelledEventIds.includes(event.id)
    )
    .map((event) => ({
      ...generateTicketData(event, user),
      isDemo: true,
      registrationId: `demo-${event.id}`,
    }));
}

function getLiveTicket(registration) {
  const event = registration.event || {};
  return {
    registrationId: registration.registrationId,
    ticketNumber: registration.registrationId,
    eventCategory: event.category || 'Campus event',
    eventTitle: event.title || 'Event',
    organizer: event.organizer || 'Event organizer',
    studentName: registration.studentName || 'Student attendee',
    rollNumber: registration.rollNumber || '',
    department: registration.department || '',
    semester: registration.semester || '',
    date: event.date || event.startDate || 'Date to be announced',
    time: event.time || event.startTime || 'Time to be announced',
    venue: event.venue || event.location || 'Venue to be announced',
    gate: event.gate || 'Main entrance',
    isDemo: false,
  };
}

export default function StudentTicketsPage() {
  const {
    user,
    registeredEventIds = [],
    cancelledEventIds = [],
    registrations = [],
    registrationSource,
    isLoadingRegistrations,
    registrationError,
    refreshRegistrations,
  } = useAuth();
  const [activeTicket, setActiveTicket] = useState(null);
  const [qrError, setQrError] = useState(null);
  const qrRequestRef = useRef(0);

  const tickets = useMemo(() => {
    if (registrationSource === 'live') {
      return registrations
        .filter((registration) => !registration.isCancelled)
        .map(getLiveTicket);
    }

    return getDemoTickets(registeredEventIds, cancelledEventIds, user);
  }, [
    cancelledEventIds,
    registeredEventIds,
    registrationSource,
    registrations,
    user,
  ]);

  const openTicket = async (ticket) => {
    const requestId = qrRequestRef.current + 1;
    qrRequestRef.current = requestId;
    setQrError(null);
    if (ticket.isDemo) {
      setActiveTicket({ ...ticket, qrStatus: 'demo' });
      return;
    }

    setActiveTicket({ ...ticket, qrStatus: 'loading' });
    try {
      const qrData = await registrationsService.getRegistrationQrToken(
        ticket.registrationId
      );
      if (qrRequestRef.current !== requestId) return;
      if (!qrData?.qrToken) {
        setActiveTicket({ ...ticket, qrStatus: 'unavailable' });
        return;
      }
      setActiveTicket({
        ...ticket,
        qrToken: qrData.qrToken,
        qrStatus:
          String(qrData.status || '').toUpperCase() === 'EXPIRED'
            ? 'expired'
            : 'ready',
      });
    } catch (error) {
      if (qrRequestRef.current !== requestId) return;
      const message =
        error?.response?.data?.message ||
        'The ticket QR code is currently unavailable.';
      setQrError(message);
      setActiveTicket({ ...ticket, qrStatus: 'unavailable' });
    }
  };

  if (isLoadingRegistrations) {
    return <LoadingState label="Loading your tickets..." />;
  }

  if (registrationError) {
    return (
      <ErrorState
        title="Unable to load tickets"
        description={registrationError}
        onRetry={refreshRegistrations}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            My Event Passes &amp; Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Digital entry passes for your enrolled campus events.
          </p>
        </div>
        <Button as={Link} to="/events" variant="primary" size="md" icon={Compass}>
          Explore More Events
        </Button>
      </div>

      {registrationSource === 'demo' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
          These are preview tickets. Backend-issued QR data is shown only for live registrations.
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-xs">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p>
          <strong className="font-semibold text-slate-900">Digital Gate Pass:</strong>{' '}
          Show the pass at the event checkpoint for registration verification.
        </p>
      </div>

      {qrError && (
        <ErrorState
          title="Ticket QR unavailable"
          description={qrError}
          onRetry={() => setQrError(null)}
        />
      )}

      {tickets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.registrationId || ticket.ticketNumber}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="border-b border-slate-100 bg-linear-to-r from-blue-50/70 via-white to-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {ticket.eventCategory}
                    </span>
                    <h2 className="mt-1 text-lg font-bold text-slate-950 transition-colors group-hover:text-blue-600">
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

              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-medium text-slate-400">Attendee</span>
                    <span className="mt-0.5 block truncate font-semibold text-slate-900">
                      {ticket.studentName}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-500">
                      {ticket.rollNumber}
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Department</span>
                    <span className="mt-0.5 block truncate font-semibold text-slate-900">
                      {ticket.department || 'Not provided'}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {ticket.semester}
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Date &amp; Time</span>
                    <span className="mt-0.5 flex items-center gap-1 font-semibold text-slate-900">
                      <CalendarDays className="h-3 w-3 shrink-0 text-slate-400" />
                      {ticket.date}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                      {ticket.time}
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">Venue &amp; Gate</span>
                    <span className="mt-0.5 flex items-center gap-1 truncate font-semibold text-slate-900">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      {ticket.venue}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-blue-600">
                      {ticket.gate}
                    </span>
                  </div>
                </div>

                <div className="relative my-5 -mx-5 flex items-center">
                  <div className="h-4 w-4 rounded-r-full border-r border-t border-b border-slate-200 bg-slate-50" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <div className="h-4 w-4 rounded-l-full border-l border-t border-b border-slate-200 bg-slate-50" />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-900">
                        {ticket.isDemo ? 'Demo ticket' : 'Backend ticket'}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {ticket.isDemo ? 'Preview only' : 'QR fetched securely'}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Ticket}
                    onClick={() => openTicket(ticket)}
                  >
                    View &amp; Print Pass
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No event passes available"
          description="Active registrations will appear here with their backend-issued ticket details."
          action={
            <Button as={Link} to="/events" size="sm" icon={Compass}>
              Find Events to Join
            </Button>
          }
        />
      )}

      <TicketModal
        isOpen={Boolean(activeTicket)}
        onClose={() => {
          qrRequestRef.current += 1;
          setActiveTicket(null);
        }}
        ticket={activeTicket}
      />
    </div>
  );
}
