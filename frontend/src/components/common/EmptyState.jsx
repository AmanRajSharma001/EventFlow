import { useId } from 'react';
import { CalendarDays } from 'lucide-react';

export default function EmptyState({
  eyebrow,
  title,
  description,
  icon: Icon = CalendarDays,
  action,
  headingLevel = 2,
  className = '',
}) {
  const generatedId = useId();
  const headingId = `empty-state-${generatedId}`;
  const Heading = `h${Math.min(6, Math.max(1, headingLevel))}`;

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center sm:px-8 sm:py-16 ${className}`}
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-500">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      {eyebrow && (
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-blue-600">
          {eyebrow}
        </p>
      )}
      <Heading
        id={headingId}
        className={`${eyebrow ? 'mt-2' : 'mt-5'} text-xl font-semibold tracking-tight text-slate-900`}
      >
        {title}
      </Heading>
      {description && (
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </section>
  );
}
