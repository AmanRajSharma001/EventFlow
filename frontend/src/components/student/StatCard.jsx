export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  className = '',
}) {
  const badgeStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition duration-150 hover:border-slate-300 sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {value}
            </span>
            {badgeText && (
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-none ${badgeStyles[badgeVariant] || badgeStyles.neutral}`}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
