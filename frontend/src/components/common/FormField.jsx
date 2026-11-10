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
            <span aria-hidden="true" className="ml-1 text-rose-700">*</span>
            <span className="sr-only"> required</span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p className="ef-field-error" id={`${id}-error`} role="alert">
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
