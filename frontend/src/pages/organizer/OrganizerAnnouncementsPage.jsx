import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Megaphone,
  Pin,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { useOrganizer } from '../../hooks/useOrganizer';
import EventStatusBadge from '../../components/organizer/EventStatusBadge';
import ConfirmationDialog from '../../components/student/ConfirmationDialog';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import announcementsService from '../../services/announcements.service';
import { isDatabasePendingError } from '../../services/dbStatus';

export default function OrganizerAnnouncementsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    events,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
  } = useOrganizer();

  const currentEvent = events.find((e) => e.id === id) || events[0];

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'Normal',
    pinned: false,
  });
  const [errors, setErrors] = useState({});
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [eventAnnouncements, setEventAnnouncements] = useState([]);
  const [announcementSource, setAnnouncementSource] = useState('demo');
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementError, setAnnouncementError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoAnnouncements = useMemo(() => {
    if (!currentEvent) return [];
    return announcements
      .filter((a) => a.eventId === currentEvent.id)
      .sort((a, b) => Number(b.pinned || 0) - Number(a.pinned || 0));
  }, [announcements, currentEvent]);

  const refreshAnnouncements = useCallback(async () => {
    if (!currentEvent) return;

    const token = localStorage.getItem('eventflow_token');
    setAnnouncementError(null);
    if (!token) {
      setAnnouncementSource('demo');
      setEventAnnouncements(demoAnnouncements);
      return;
    }

    setIsLoadingAnnouncements(true);
    try {
      const liveAnnouncements = await announcementsService.getEventAnnouncements(
        currentEvent.id
      );
      setEventAnnouncements(liveAnnouncements);
      setAnnouncementSource('live');
    } catch (error) {
      if (isDatabasePendingError(error)) {
        setAnnouncementSource('demo');
        setEventAnnouncements(demoAnnouncements);
      } else {
        setAnnouncementSource('live');
        setEventAnnouncements([]);
        setAnnouncementError(
          error?.response?.data?.message ||
            'Unable to load event announcements.'
        );
      }
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, [currentEvent, demoAnnouncements]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      await refreshAnnouncements();
    };
    loadAnnouncements();
  }, [refreshAnnouncements]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Announcement title is required.' });
      return;
    }
    if (!formData.message.trim()) {
      setErrors({ message: 'Message content is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (announcementSource === 'live') {
        const created = await announcementsService.createEventAnnouncement(
          currentEvent.id,
          {
            title: formData.title.trim(),
            message: formData.message.trim(),
            priority: formData.priority.toUpperCase(),
            isPinned: formData.pinned,
          }
        );
        setEventAnnouncements((prev) => [created, ...prev]);
      } else {
        addAnnouncement({
          eventId: currentEvent.id,
          ...formData,
        });
        setEventAnnouncements((prev) => [
          {
            id: `demo-${Date.now()}`,
            eventId: currentEvent.id,
            publishedAt: 'Today · Just now',
            ...formData,
          },
          ...prev,
        ]);
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        setAnnouncementSource('demo');
        addAnnouncement({
          eventId: currentEvent.id,
          ...formData,
        });
      } else {
        setAnnouncementError(
          error?.response?.data?.message ||
            'Unable to publish this announcement.'
        );
        setIsSubmitting(false);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }

    setFormData({
      title: '',
      message: '',
      priority: 'Normal',
      pinned: false,
    });
    setErrors({});
    setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;
    setIsSubmitting(true);
    try {
      if (announcementSource === 'live') {
        await announcementsService.deleteAnnouncement(announcementToDelete.id);
        setEventAnnouncements((prev) =>
          prev.filter((announcement) => announcement.id !== announcementToDelete.id)
        );
      } else {
        deleteAnnouncement(announcementToDelete.id);
        setEventAnnouncements((prev) =>
          prev.filter((announcement) => announcement.id !== announcementToDelete.id)
        );
      }
    } catch (error) {
      if (isDatabasePendingError(error)) {
        setAnnouncementSource('demo');
        deleteAnnouncement(announcementToDelete.id);
        setEventAnnouncements((prev) =>
          prev.filter((announcement) => announcement.id !== announcementToDelete.id)
        );
      } else {
        setAnnouncementError(
          error?.response?.data?.message ||
            'Unable to delete this announcement.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
    setAnnouncementToDelete(null);
  };

  if (!currentEvent) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No Event Selected"
        description="Select an event to view or broadcast announcements."
        action={
          <Button as={Link} to="/organizer/events" size="sm">
            View All Events
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header & Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <EventStatusBadge status={currentEvent.status} />
            <span className="text-xs font-semibold text-slate-500">
              {currentEvent.category}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Broadcast Alerts: {currentEvent.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>{currentEvent.date}</span> · <span>{currentEvent.venue}</span>
          </p>
        </div>

        {/* Switch Event Dropdown & Create Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={currentEvent.id}
            onChange={(e) => navigate(`/organizer/events/${e.target.value}/announcements`)}
            className="ef-input text-xs w-auto max-w-xs"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setFormOpen(!formOpen)}
          >
            {formOpen ? 'Cancel' : 'New Announcement'}
          </Button>
        </div>
      </div>

      {/* Create Announcement Form Accordion */}
      {announcementError && (
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-800">
          <p>{announcementError}</p>
          <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={refreshAnnouncements}>
            Retry announcements
          </Button>
        </div>
      )}

      {isLoadingAnnouncements && <LoadingState label="Loading announcements..." />}

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-blue-600" />
              Compose Broadcast to Enrolled Participants
            </h2>
            <span className="text-xs text-slate-400">            {announcementSource === 'live' ? 'Live Event Announcement' : 'Preview Session'}</span>
          </div>

          <FormField id="ann-title" label="Announcement Headline" error={errors.title} required>
            <input
              id="ann-title"
              type="text"
              placeholder="e.g. Wi-Fi Access and Block 4 Station Allocation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="ef-input"
            />
          </FormField>

          <FormField id="ann-message" label="Message Details" error={errors.message} required>
            <textarea
              id="ann-message"
              rows={4}
              placeholder="Write the full update, reporting time, lab guidelines, or venue change specifics..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="ef-input"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2 items-center">
            <FormField id="ann-priority" label="Priority Level">
              <select
                id="ann-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="ef-input text-xs"
              >
                <option value="Normal">Normal Notification</option>
                <option value="Important">Important Update</option>
                <option value="Urgent">Urgent / Action Required</option>
              </select>
            </FormField>

            <label className="flex items-center gap-2.5 mt-4 sm:mt-0 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <Pin className="h-3.5 w-3.5 text-blue-600" />
                Pin announcement to top of student view
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Broadcast Announcement'}
            </Button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {eventAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {eventAnnouncements.map((ann) => (
            <article
              key={ann.id}
              className={`rounded-2xl border p-5 shadow-xs transition hover:border-slate-300 ${
                ann.pinned
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}

                    <Badge
                      variant={
                        ann.priority === 'Urgent'
                          ? 'red'
                          : ann.priority === 'Important'
                          ? 'amber'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {ann.priority}
                    </Badge>

                    <span className="text-xs text-slate-400">
                      {ann.publishedAt}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-950">
                    {ann.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.message}
                  </p>

                  <p className="mt-3 text-[11px] text-slate-400">
                    Author: <span className="font-semibold text-slate-600">{ann.author}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAnnouncementToDelete(ann)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No announcements published"
          description="You haven't broadcasted any updates for this event yet. Keep your participants informed about venue details and schedules."
          action={
            <Button
              type="button"
              size="sm"
              icon={Plus}
              onClick={() => setFormOpen(true)}
            >
              Create First Announcement
            </Button>
          }
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(announcementToDelete)}
        onClose={() => setAnnouncementToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement?"
        description={`Are you sure you want to delete "${announcementToDelete?.title}"? It will no longer appear in student notification inboxes.`}
        confirmLabel="Yes, Delete Announcement"
        cancelLabel="Keep Announcement"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
}
