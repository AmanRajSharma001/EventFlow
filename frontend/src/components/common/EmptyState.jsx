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
      className={`rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center sm:px-8 sm:py-14 ${className}`}
    >
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-600">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      {eyebrow && (
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">
          {eyebrow}
        </p>
      )}
      <Heading id={headingId} className={`${eyebrow ? 'mt-2' : 'mt-4'} text-lg font-semibold tracking-tight text-slate-950 sm:text-xl`}>
        {title}
      </Heading>
      {description && (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  );
}
