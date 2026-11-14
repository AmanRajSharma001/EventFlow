import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Compass,
  ImageOff,
  Search,
  UsersRound,
} from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import EventCard from '../../components/events/EventCard';
import { mockCategories, mockCollegeEvents } from '../../data/mockEvents';
import { isPastEvent, matchesEventQuery } from '../../utils/eventUtils';

const featuredEvent =
  mockCollegeEvents.find((event) => event.featured && !isPastEvent(event)) || mockCollegeEvents[0];

const campusGroups = (() => {
  const groups = new Map();

  mockCollegeEvents.filter((event) => !isPastEvent(event)).forEach((event) => {
    const group = groups.get(event.organizer) || { name: event.organizer, events: [] };
    group.events.push(event);
    groups.set(event.organizer, group);
  });

  return [...groups.values()].slice(0, 4);
})();

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [featuredImageFailed, setFeaturedImageFailed] = useState(false);

  const filteredEvents = useMemo(() => {
    return mockCollegeEvents
      .filter((event) => isPastEvent(event) === showPastEvents)
      .filter((event) => selectedCategory === 'all' || event.category === selectedCategory)
      .filter((event) => matchesEventQuery(event, searchQuery))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [searchQuery, selectedCategory, showPastEvents]);

  const previewEvents = filteredEvents.slice(0, 3);
  const catalogParams = new URLSearchParams();
  if (selectedCategory !== 'all') catalogParams.set('category', selectedCategory);
  if (searchQuery.trim()) catalogParams.set('q', searchQuery.trim());
  const catalogPath = `/events${catalogParams.size ? `?${catalogParams.toString()}` : ''}`;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="ef-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-900">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Campus events, in one place
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">
              Find the campus events you don’t want to miss.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore events hosted by campus clubs, councils, and departments. Compare dates, venues, and event details before you decide what to attend.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/events" icon={ArrowRight} iconPosition="right" size="lg">
                Explore events
              </Button>
              <Button as={Link} to="/#campus-groups" variant="secondary" size="lg">
                Meet campus groups
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><Compass aria-hidden="true" className="h-4 w-4 text-blue-600" />Browse campus activities</span>
              <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden="true" className="h-4 w-4 text-blue-600" />Compare dates and venues</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-900/10">
              <Link to={`/events/${featuredEvent.id}`} className="group relative block aspect-[16/11] overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-500">
                {featuredImageFailed ? (
                  <div aria-hidden="true" className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-900 text-slate-300">
                    <ImageOff className="h-8 w-8" />
                    <span className="text-sm font-medium">Event cover unavailable</span>
                  </div>
                ) : (
                  <img
                    src={featuredEvent.imageUrl}
                    alt=""
                    fetchPriority="high"
                    onError={() => setFeaturedImageFailed(true)}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/30 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    Featured event · Sample listing
                  </span>
                  <h2 className="mt-4 max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                    {featuredEvent.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
                    <span>{featuredEvent.date}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-white/70 sm:block" />
                    <span>{featuredEvent.venue}</span>
                  </div>
                </div>
                <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:right-7 sm:top-7">
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                </span>
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
              <span>{featuredEvent.organizer}</span>
              <span className="font-medium text-slate-700">{featuredEvent.category}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="upcoming-events" className="ef-container scroll-mt-24 py-14 sm:py-20">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Event discovery</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {showPastEvents ? 'From the campus archive' : 'What’s coming up'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Browse sample listings by interest, search for a club or venue, and open an event for its details.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-72">
              <label className="sr-only" htmlFor="home-event-search">Search sample events</label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="home-event-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search events or clubs"
                className="ef-input pl-10"
              />
            </div>
            <Button as={Link} to={catalogPath} variant="secondary" className="shrink-0">
              Full event catalog
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1" role="group" aria-label="Choose event time period">
            <button
              type="button"
              aria-pressed={!showPastEvents}
              onClick={() => setShowPastEvents(false)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${!showPastEvents ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Upcoming
            </button>
            <button
              type="button"
              aria-pressed={showPastEvents}
              onClick={() => setShowPastEvents(true)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${showPastEvents ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Past events
            </button>
          </div>
          <div id="categories" className="flex flex-wrap gap-2" role="group" aria-label="Filter events by category">
            {mockCategories.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 text-sm text-slate-600" aria-live="polite">
          <p>{filteredEvents.length} sample {filteredEvents.length === 1 ? 'event' : 'events'}{selectedCategory !== 'all' ? ` · ${mockCategories.find((category) => category.id === selectedCategory)?.name}` : ''}</p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="shrink-0 rounded-md font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>

        {previewEvents.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {previewEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No matching sample events"
            description="Try a different search or category to explore the current demo listings."
            className="mt-5"
            action={(
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                Reset search and category
              </Button>
            )}
          />
        )}
        {filteredEvents.length > previewEvents.length && (
          <div className="mt-8 text-center">
            <Button as={Link} to={catalogPath} variant="secondary" icon={ArrowRight} iconPosition="right">
              Browse all {filteredEvents.length} matching events
            </Button>
          </div>
        )}
      </section>

      <section id="campus-groups" className="scroll-mt-24 border-y border-slate-200 bg-white py-14 sm:py-20">
        <div className="ef-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Clubs, councils & societies</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Meet the groups behind campus events.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Start with the student groups and campus organizations represented in the current sample listings.
              </p>
            </div>
            <Button as={Link} to="/events" variant="secondary" icon={ArrowRight} iconPosition="right" className="shrink-0">
              Explore all events
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {campusGroups.map((group) => {
              const nextEvent = group.events[0];
              const eventCount = group.events.length;

              return (
                <article key={group.name} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition-colors hover:border-slate-300 hover:bg-white motion-reduce:transition-none sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                      <UsersRound className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {nextEvent.category}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold leading-snug tracking-tight text-slate-950">{group.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {eventCount} upcoming sample {eventCount === 1 ? 'listing' : 'listings'}
                  </p>
                  <Link
                    to={`/events?q=${encodeURIComponent(group.name)}`}
                    className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-blue-700 outline-none transition-colors hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none"
                  >
                    View group events <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="students" className="scroll-mt-24 border-y border-slate-200 bg-white py-14 sm:py-20">
        <div className="ef-container">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">A clearer event journey</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">From discovery to participation history.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              EventFlow is being shaped around the steps students and organizers take before, during, and after campus events.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              { step: '01', title: 'Discover and register', text: 'Find activities by category, department, date, and the groups hosting them.' },
              { step: '02', title: 'Check in on event day', text: 'Give organizers a clearer way to manage attendance when those tools are connected.' },
              { step: '03', title: 'Keep a participation record', text: 'Build a useful history of the events you attend as the student experience grows.' },
            ].map((item) => (
              <article key={item.step} className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-sm font-semibold text-white">{item.step}</span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="organizers" className="ef-container scroll-mt-24 py-14 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><UsersRound aria-hidden="true" className="h-5 w-5" /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">For students</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Spend less time searching for event details.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Explore campus listings and quickly find the dates, venues, and groups hosting each activity.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to="/events" icon={ArrowRight} iconPosition="right">Browse events</Button>
              <Button as={Link} to="/register" variant="secondary">Create a preview account</Button>
            </div>
          </article>
          <article className="flex flex-col rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-8">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white"><Check aria-hidden="true" className="h-5 w-5" /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-300">For organizers</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">A shared starting point for campus activities.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Event creation and participant tools are planned for a later release. This preview focuses on discovering campus activities.</p>
            <div className="mt-6">
              <Button as={Link} to="/login" variant="secondary" icon={ArrowUpRight} iconPosition="right">Open preview sign-in</Button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
