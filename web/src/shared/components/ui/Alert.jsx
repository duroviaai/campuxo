import { Icon, StatusIcons } from '../icons/IconLibrary';

const VARIANTS = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: StatusIcons.success,
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: StatusIcons.error,
    iconColor: 'text-red-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: StatusIcons.warning,
    iconColor: 'text-amber-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: StatusIcons.info,
    iconColor: 'text-blue-600',
  },
};

const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  onClose,
  className = '',
  ...props
}) => {
  const config = VARIANTS[variant];

  return (
    <div
      className={`
        flex gap-3 p-4 rounded-lg border
        ${config.bg} ${config.border} ${config.text}
        animate-fade-in
        ${className}
      `}
      {...props}
    >
      <Icon icon={icon || config.icon} size="md" className={`shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-lg hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
