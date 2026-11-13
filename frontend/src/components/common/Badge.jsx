export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-sky-50 text-sky-700 border-sky-200',
    navy: 'bg-slate-900 text-white border-slate-900',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-stone-100 text-stone-600 border-stone-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const sizes = {
    sm: 'min-h-5 px-2 text-[10px] tracking-wide',
    md: 'min-h-5.5 px-2.5 text-xs',
    lg: 'min-h-6.5 px-3 text-xs',
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-md border font-semibold uppercase tracking-wide leading-none ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className} py-1`}
    >
      {children}
    </span>
  );
}
