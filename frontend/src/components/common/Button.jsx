import { LoaderCircle } from 'lucide-react';

const variants = {
  primary:
    'border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800 focus-visible:ring-blue-600',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:ring-slate-400',
  outline:
    'border border-blue-200 bg-transparent text-blue-700 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 focus-visible:ring-blue-500',
  ghost:
    'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400',
  danger:
    'border border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700 hover:border-red-700 active:bg-red-800 focus-visible:ring-red-600',
  accent:
    'border border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:border-slate-800 active:bg-slate-950 focus-visible:ring-slate-900',
};

const sizes = {
  xs: 'min-h-8 gap-1.5 px-3 text-xs rounded-md',
  sm: 'min-h-9 gap-1.5 px-3.5 text-sm',
  md: 'min-h-10 gap-2 px-4.5 text-sm',
  lg: 'min-h-11 gap-2 px-5 text-base',
  xl: 'min-h-12 gap-2.5 px-6 text-base',
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
      className={`inline-flex items-center justify-center rounded-lg font-semibold tracking-tight outline-none transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {(isLoading || (Icon && iconPosition === 'left')) && (
        <LeadingIcon
          aria-hidden="true"
          focusable="false"
          className={`h-4 w-4 shrink-0 ${isLoading ? 'motion-safe:animate-spin' : ''}`}
        />
      )}
      <span>{isLoading ? loadingLabel : children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon aria-hidden="true" focusable="false" className="h-4 w-4 shrink-0" />
      )}
    </Component>
  );
}
