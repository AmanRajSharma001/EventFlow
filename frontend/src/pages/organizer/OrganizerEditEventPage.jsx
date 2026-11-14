import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { useOrganizer } from '../../hooks/useOrganizer';
import EventForm from '../../components/organizer/EventForm';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export default function OrganizerEditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, updateEvent } = useOrganizer();

  const eventToEdit = events.find((e) => e.id === id);

  if (!eventToEdit) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Edit3}
          title="Event Not Found"
          description={`No event matching ID "${id}" was found in your managed events.`}
          action={
            <Button as={Link} to="/organizer/events" size="sm" icon={ArrowLeft}>
              Return to Events
            </Button>
          }
        />
      </div>
    );
  }

  const handleUpdate = async (formData) => {
    await updateEvent(eventToEdit.id, formData);
    navigate('/organizer/events');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Edit3 className="h-3.5 w-3.5" />
            <span>Editing Event #{eventToEdit.id}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Edit Event Details
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update schedule, seat quota, or venue specifics. Changes reflect immediately in local mock state.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/organizer/events')}
        >
          Back to Events
        </Button>
      </div>

      {/* Pre-filled Event Form */}
      <EventForm
        initialValues={eventToEdit}
        onSubmit={handleUpdate}
        isEdit={true}
        onCancel={() => navigate('/organizer/events')}
      />
    </div>
  );
}
