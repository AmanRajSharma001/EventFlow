import { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Image,
  MapPin,
  Save,
  Send,
  Users,
} from 'lucide-react';
import { mockCategories } from '../../data/mockEvents';
import Button from '../common/Button';
import FormField from '../common/FormField';

const departmentList = [
  'Department of Computer Science & Engineering',
  'Department of Information Technology',
  'Department of Electronics & Communication',
  'Department of Mechanical Engineering',
  'Department of Civil Engineering',
  'School of Business & Management',
  'Dean of Student Welfare & Cultural Affairs',
  'University Sports Council',
];

export default function EventForm({
  initialValues = {},
  onSubmit,
  isEdit = false,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    category: initialValues.category || 'Technical',
    imageUrl:
      initialValues.imageUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    startDate: initialValues.startDate || '',
    endDate: initialValues.endDate || '',
    startTime: initialValues.startTime || '09:00',
    endTime: initialValues.endTime || '17:00',
    venue: initialValues.venue || '',
    location: initialValues.location || '',
    department: initialValues.department || departmentList[0],
    maxSeats: initialValues.maxSeats || 100,
    registrationDeadline: initialValues.registrationDeadline || '',
    price: initialValues.price || 'Free',
  });

  const [errors, setErrors] = useState({});
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required.';
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (!formData.endDate) newErrors.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be earlier than start date.';
    }
    if (Number(formData.maxSeats) < 1) newErrors.maxSeats = 'Capacity must be at least 1.';
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (publishStatus) => {
    if (!validate()) return;

    // Format human-readable date & time strings
    const startFormatted = new Date(formData.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endFormatted = formData.endDate
      ? new Date(formData.endDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : startFormatted;

    const dateString =
      startFormatted === endFormatted
        ? startFormatted
        : `${startFormatted} – ${endFormatted}`;

    const submissionData = {
      ...formData,
      maxSeats: Number(formData.maxSeats),
      date: dateString,
      time: `${formData.startTime} – ${formData.endTime}`,
    };

    onSubmit(submissionData, publishStatus);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(isEdit ? initialValues.status || 'PUBLISHED' : 'PUBLISHED');
      }}
      className="space-y-6"
    >
      {/* Basic Event Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
          Event Details &amp; Branding
        </h2>

        <FormField id="event-title" label="Event Title" error={errors.title} required>
          <input
            id="event-title"
            type="text"
            placeholder="e.g. National Hackathon 2026: 36-Hour Code Sprint"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="ef-input"
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="event-category" label="Category" required>
            <select
              id="event-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="ef-input"
            >
              {mockCategories
                .filter((c) => c.id !== 'all')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField id="event-dept" label="Hosting Department / Wing" required>
            <select
              id="event-dept"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="ef-input"
            >
              {departmentList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="event-description" label="Event Description" error={errors.description} required>
          <textarea
            id="event-description"
            rows={4}
            placeholder="Explain what the event is about, competitive tracks, eligibility, and what participants should expect..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="ef-input"
          />
        </FormField>

        {/* Cover Image & Live Preview */}
        <div>
          <FormField id="event-image" label="Cover Image URL">
            <div className="relative">
              <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => {
                  handleChange('imageUrl', e.target.value);
                  setImagePreviewFailed(false);
                }}
                className="ef-input pl-10"
              />
            </div>
          </FormField>

          {formData.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {imagePreviewFailed ? (
                <div className="flex h-36 items-center justify-center text-xs text-slate-400">
                  Image preview unavailable (invalid URL or blocked by browser)
                </div>
              ) : (
                <div className="relative h-44 w-full">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    onError={() => setImagePreviewFailed(true)}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                    Live Cover Preview
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule & Location */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
          Schedule &amp; Venue
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="event-start-date" label="Start Date" error={errors.startDate} required>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="ef-input pl-10"
              />
            </div>
          </FormField>

          <FormField id="event-end-date" label="End Date" error={errors.endDate} required>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="ef-input pl-10"
              />
            </div>
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="event-start-time" label="Daily Start Time" required>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="ef-input pl-10"
              />
            </div>
          </FormField>

          <FormField id="event-end-time" label="Daily End Time" required>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="ef-input pl-10"
              />
            </div>
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="event-venue" label="Primary Venue" error={errors.venue} required>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-venue"
                type="text"
                placeholder="e.g. Computing Hub, Block 4"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                className="ef-input pl-10"
              />
            </div>
          </FormField>

          <FormField id="event-location" label="Room / Gate Specifics">
            <input
              id="event-location"
              type="text"
              placeholder="e.g. 3rd Floor Labs 301–304"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="ef-input"
            />
          </FormField>
        </div>
      </div>

      {/* Registration & Capacity Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
          Capacity &amp; Registration Constraints
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormField id="event-capacity" label="Maximum Seat Capacity" error={errors.maxSeats} required>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="event-capacity"
                type="number"
                min="1"
                placeholder="100"
                value={formData.maxSeats}
                onChange={(e) => handleChange('maxSeats', e.target.value)}
                className="ef-input pl-10"
              />
            </div>
          </FormField>

          <FormField
            id="event-deadline"
            label="Registration Deadline"
            error={errors.registrationDeadline}
            required
          >
            <input
              id="event-deadline"
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) => handleChange('registrationDeadline', e.target.value)}
              className="ef-input"
            />
          </FormField>

          <FormField id="event-price" label="Registration Fee">
            <input
              id="event-price"
              type="text"
              placeholder="Free / Free for Students"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="ef-input"
            />
          </FormField>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-slate-200 pt-5">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}

        {!isEdit && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={Save}
            onClick={() => handleSubmit('DRAFT')}
          >
            Save as Draft
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={isEdit ? Save : Send}
          onClick={() => handleSubmit(isEdit ? initialValues.status || 'PUBLISHED' : 'PUBLISHED')}
        >
          {isEdit ? 'Save Changes' : 'Publish Event'}
        </Button>
      </div>
    </form>
  );
}
