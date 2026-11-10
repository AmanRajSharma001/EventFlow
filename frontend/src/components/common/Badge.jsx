export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    navy: 'bg-slate-900 text-white border-slate-900',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/70',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const sizes = {
    sm: 'min-h-5 px-2 text-[11px]',
    md: 'min-h-6 px-2.5 text-xs',
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-md border font-semibold leading-none ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}
