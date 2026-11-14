import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useOrganizer } from '../../hooks/useOrganizer';
import EventForm from '../../components/organizer/EventForm';
import Button from '../../components/common/Button';

export default function OrganizerCreateEventPage() {
  const { createEvent } = useOrganizer();
  const navigate = useNavigate();

  const handleFormSubmit = async (formData, publishStatus) => {
    const isPublish = publishStatus === 'PUBLISHED';
    await createEvent(formData, isPublish);
    navigate('/organizer/events');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Event Creation Studio</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Create Campus Event
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Fill in the schedule, seat capacity, venue, and descriptions to publish an activity for students.
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

      {/* Reusable Form */}
      <EventForm
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/organizer/events')}
      />
    </div>
  );
}
