import { LoaderCircle } from 'lucide-react';

const variants = {
  primary:
    'border border-slate-900 bg-slate-900 text-white shadow-sm hover:border-slate-800 hover:bg-slate-800 focus-visible:ring-slate-900',
  secondary:
    'border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-500',
  outline:
    'border border-slate-300 bg-transparent text-slate-800 hover:border-slate-400 hover:bg-slate-100 focus-visible:ring-slate-500',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-500',
  accent:
    'border border-indigo-600 bg-indigo-600 text-white shadow-sm hover:border-indigo-700 hover:bg-indigo-700 focus-visible:ring-indigo-600',
};

const sizes = {
  sm: 'min-h-11 gap-1.5 px-3.5 text-xs',
  md: 'min-h-11 gap-2 px-4 text-sm',
  lg: 'min-h-12 gap-2.5 px-5 text-sm sm:text-base',
};

export default function Button({
  as: Component = 'button',
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  isLoading = false,
  loadingLabel = 'Working…',
  type = 'button',
  onClick,
  ...props
}) {
  const isNativeButton = Component === 'button';
  const isDisabled = disabled || isLoading;
  const stateProps = isNativeButton
    ? { type, disabled: isDisabled }
    : {
        'aria-disabled': isDisabled || undefined,
        tabIndex: isDisabled ? -1 : props.tabIndex,
      };

  const handleClick = (event) => {
    if (!isNativeButton && isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const LeadingIcon = isLoading ? LoaderCircle : Icon;

  return (
    <Component
      {...props}
      {...stateProps}
      aria-busy={isLoading || undefined}
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-lg font-semibold outline-none transition duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {(isLoading || (Icon && iconPosition === 'left')) && (
        <LeadingIcon aria-hidden="true" focusable="false" className={`h-4 w-4 shrink-0 ${isLoading ? 'motion-safe:animate-spin' : ''}`} />
      )}
      <span>{isLoading ? loadingLabel : children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon aria-hidden="true" focusable="false" className="h-4 w-4 shrink-0" />
      )}
    </Component>
  );
}
