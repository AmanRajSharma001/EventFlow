export default function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
}) {
  return (
    <div className="space-y-1.5">
      <label className="ef-label" htmlFor={id}>
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-blue-600">*</span>
            <span className="sr-only"> required</span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p className="ef-field-error flex items-center gap-1.5" id={`${id}-error`} role="alert">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="ef-field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
