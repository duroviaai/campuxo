import { Icon } from '../icons/IconLibrary';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-sm',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
  success: 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md',
  info: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md',
  ghost: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300',
  outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
};

const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-3.5 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Icon icon={faCircleNotch} size="sm" className="animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon icon={icon} size="sm" />}
          {children}
          {icon && iconPosition === 'right' && <Icon icon={icon} size="sm" />}
        </>
      )}
    </button>
  );
};

export default Button;
