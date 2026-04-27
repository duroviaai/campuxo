import { Icon, StatusIcons } from '../icons/IconLibrary';

const VARIANTS = {
  success: 'bg-green-50 text-green-700 border border-green-200',
  error: 'bg-red-50 text-red-700 border border-red-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

const SIZES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  withIcon = false,
  className = '',
  ...props
}) => {
  const statusIcon = {
    success: StatusIcons.success,
    error: StatusIcons.error,
    warning: StatusIcons.warning,
    info: StatusIcons.info,
  }[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        transition-colors duration-200
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {(withIcon || icon) && (
        <Icon icon={icon || statusIcon} size="sm" />
      )}
      {children}
    </span>
  );
};

export default Badge;
