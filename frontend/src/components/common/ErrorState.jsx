import { useId } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this information. Please try again.",
  onRetry,
  action,
  className = '',
}) {
  const headingId = `eventflow-error-${useId()}`;

  return (
    <section
      role="alert"
      aria-labelledby={headingId}
      className={`rounded-2xl border border-red-100 bg-red-50/50 px-6 py-12 text-center sm:px-8 ${className}`}
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white border border-red-200 shadow-sm text-red-500">
        <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 id={headingId} className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mx-auto mt-2.5 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {(onRetry || action) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
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
