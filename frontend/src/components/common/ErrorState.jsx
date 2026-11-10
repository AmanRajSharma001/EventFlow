import { useId } from 'react';
import { CircleAlert, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this information. Please try again.',
  onRetry,
  action,
  className = '',
}) {
  const headingId = `eventflow-error-${useId()}`;

  return (
    <section
      role="alert"
      aria-labelledby={headingId}
      className={`rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center sm:px-8 ${className}`}
    >
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-700">
        <CircleAlert aria-hidden="true" className="h-5 w-5" />
      </span>
      <h2 id={headingId} className="mt-4 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {description}
      </p>
      {(onRetry || action) && (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <Button type="button" variant="secondary" onClick={onRetry} icon={RotateCcw}>
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </section>
  );
}
