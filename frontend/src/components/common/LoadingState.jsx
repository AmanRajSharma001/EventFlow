import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center gap-3 py-16 text-sm text-slate-500 ${className}`}
    >
      <Loader2 aria-hidden="true" className="h-7 w-7 text-blue-600 motion-safe:animate-spin" />
      <span>{label}</span>
    </div>
  );
}
