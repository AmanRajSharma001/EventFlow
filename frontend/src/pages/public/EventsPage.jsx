import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarDays, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { mockCollegeEvents, mockCategories } from '../../data/mockEvents';
import { getEventCapacity, isPastEvent, matchesEventQuery } from '../../utils/eventUtils';

const departments = ['all', ...new Set(mockCollegeEvents.map((event) => event.department))];

export default function EventsPage() {
  const { search } = useLocation();
  const initialParams = new URLSearchParams(search);
  const initialCategory = initialParams.get('category');
  const initialQuery = initialParams.get('q') || '';
  const isKnownCategory = mockCategories.some((category) => category.id === initialCategory);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(isKnownCategory ? initialCategory : 'all');
  const [timelineTab, setTimelineTab] = useState('upcoming');
  const [sortBy, setSortBy] = useState('date-asc');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const filteredEvents = useMemo(() => {
    return mockCollegeEvents
      .filter((event) => {
        if (timelineTab === 'upcoming' && isPastEvent(event)) return false;
        if (timelineTab === 'past' && !isPastEvent(event)) return false;
        if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
        if (selectedDepartment !== 'all' && event.department !== selectedDepartment) return false;
        return matchesEventQuery(event, searchQuery);
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.startDate) - new Date(a.startDate);
        if (sortBy === 'popularity') {
          const attendeeDifference = (Number(b.attendeesCount) || 0) - (Number(a.attendeesCount) || 0);
          return attendeeDifference || new Date(a.startDate) - new Date(b.startDate);
        }
        if (sortBy === 'seats-asc') {
          return getEventCapacity(a).seatsLeft - getEventCapacity(b).seatsLeft;
        }
        if (sortBy === 'seats-desc') {
          return getEventCapacity(b).seatsLeft - getEventCapacity(a).seatsLeft;
        }
        return new Date(a.startDate) - new Date(b.startDate);
      });
  }, [searchQuery, selectedCategory, timelineTab, sortBy, selectedDepartment]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory !== 'all' || timelineTab !== 'upcoming' ||
    selectedDepartment !== 'all' || sortBy !== 'date-asc'
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setTimelineTab('upcoming');
    setSelectedDepartment('all');
    setSortBy('date-asc');
  };

  const upcomingCount = mockCollegeEvents.filter((event) => !isPastEvent(event)).length;
  const pastCount = mockCollegeEvents.length - upcomingCount;
  const timelineOptions = [
    { id: 'upcoming', label: `Upcoming · ${upcomingCount}` },
    { id: 'past', label: `Past · ${pastCount}` },
    { id: 'all', label: `All · ${mockCollegeEvents.length}` },
  ];

  return (
    <div className="ef-container py-10 sm:py-14">
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Campus calendar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Explore campus events</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Find sample events by category, department, date, or the group hosting them. Open any listing for its full details.
          </p>
        </div>
        <div className="inline-flex w-fit flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Filter events by time">
          {timelineOptions.map((option) => {
            const active = timelineTab === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTimelineTab(option.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </header>

      <section aria-label="Search and filter sample events" className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
          <div className="relative">
            <label htmlFor="event-search" className="sr-only">Search sample events</label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="event-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, club, or venue"
              className="ef-input pl-10"
            />
          </div>
          <div>
            <label htmlFor="event-department" className="sr-only">Filter by department</label>
            <select
              id="event-department"
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              className="ef-input"
            >
              <option value="all">All departments</option>
              {departments.filter((department) => department !== 'all').map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label htmlFor="event-sort" className="sr-only">Sort events</label>
            <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              id="event-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="ef-input pl-10"
            >
              <option value="date-asc">Date: soonest first</option>
              <option value="date-desc">Date: latest first</option>
              <option value="popularity">Most popular (sample)</option>
              <option value="seats-asc">Capacity: filling soon</option>
              <option value="seats-desc">Capacity: most availability</option>
            </select>
          </div>
        </div>

        <div id="categories" className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2" role="group" aria-label="Filter events by category">
            {mockCategories.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md py-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </section>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm text-slate-600">
          Showing <strong className="font-semibold text-slate-950">{filteredEvents.length}</strong> {timelineTab === 'upcoming' ? 'upcoming ' : timelineTab === 'past' ? 'past ' : ''}{filteredEvents.length === 1 ? 'event' : 'events'}
        </p>
        <p className="text-xs font-medium text-slate-500">Sample listings · Not live campus data</p>
      </div>

      {filteredEvents.length ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No events match those filters"
          description="Try a broader search or reset the filters to see all sample listings."
          className="mt-5"
          action={(
            <Button type="button" variant="secondary" onClick={clearAllFilters}>
              Reset all filters
            </Button>
          )}
        />
      )}
    </div>
  );
}
