import { useState } from 'react';
import { Icon } from '../icons/IconLibrary';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Input = ({
  label,
  placeholder,
  type = 'text',
  icon,
  iconPosition = 'left',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon icon={icon} size="sm" />
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 rounded-lg text-sm font-medium
            border-2 transition-all duration-200
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300'
              : isFocused
              ? 'border-indigo-500 bg-white'
              : 'border-gray-200 bg-gray-50'
            }
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            focus:outline-none
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon icon={icon} size="sm" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          <Icon icon={faExclamationCircle} size="xs" />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
