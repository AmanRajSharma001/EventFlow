import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`inline-flex min-h-11 items-center justify-center gap-2.5 text-sm font-medium text-slate-600 ${className}`}
    >
      <LoaderCircle aria-hidden="true" className="h-4 w-4 text-indigo-600 motion-safe:animate-spin" />
      <span>{label}</span>
    </div>
  );
}
