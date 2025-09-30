import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, AlertCircle, Check } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'datetime-local' | 'tel' | 'url';
  value: any;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  error?: string;
  success?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  hint?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  placeholder,
  required = false,
  options = [],
  disabled = false,
  min,
  max,
  step,
  rows = 3,
  hint,
  icon,
  fullWidth = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const hasError = !!error;
  const hasSuccess = !!success;
  const isPassword = type === 'password';

  const baseInputClasses = `
    block w-full rounded-lg border transition-all duration-200 ease-in-out
    text-sm sm:text-base
    px-3 py-3 sm:px-4 sm:py-3
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
    ${focused ? 'ring-2 ring-offset-1' : ''}
  `;

  const getInputClasses = () => {
    if (hasError) {
      return `${baseInputClasses} border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-gray-300 dark:border-gray-600`;
    }
    if (hasSuccess) {
      return `${baseInputClasses} border-green-300 text-green-900 placeholder-green-300 focus:ring-green-500 focus:border-gray-300 dark:border-gray-600`;
    }
    return `${baseInputClasses} border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue: any = e.target.value;
    
    if (type === 'number') {
      newValue = e.target.value === '' ? '' : parseFloa"" || 0;
    }
    
    onChange(name, newValue);
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.(name);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const inputProps = {
    id: name,
    name,
    value: value || '',
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    placeholder,
    disabled,
    className: getInputClasses(),
    'aria-invalid': hasError,
    'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4 sm:mb-6`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 sm:text-base"
        >
          {label}
          {required && <span className="text-gray-600 dark:text-gray-400 ml-1" aria-label="required">*</span>}
        </label>
        {hint && !error && !success && (
          <span className="text-xs text-gray-500 sm:text-sm">{hint}</span>
        )}
      </div>
      
      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        {/* Input Field */}
        {type === 'textarea' ? (
          <textarea
            {...inputProps}
            rows={rows}
            className={`${getInputClasses()} resize-vertical min-h-[80px] ${icon ? 'pl-10' : ''}`}
          />
        ) : type === 'select' ? (
          <div className="relative">
            <select
              {...inputProps}
              className={`${getInputClasses()} appearance-none pr-10 ${icon ? 'pl-10' : ''}`}
            >
              <option value="" disabled>
                {placeholder || "Placeholder"}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ) : (
          <input
            {...inputProps}
            type={isPassword && showPassword ? 'text' : type}
            min={min}
            max={max}
            step={step}
            className={`${getInputClasses()} ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`}
            // Mobile-specific attributes
            autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'on'}
            inputMode={
              type === 'number' ? 'numeric' :
              type === 'email' ? 'email' :
              type === 'tel' ? 'tel' :
              type === 'url' ? 'url' : 'text'
            }
          />
        )}
        
        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        
        {/* Success Icon */}
        {hasSuccess && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        )}
        
        {/* Error Icon */}
        {hasError && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Help Text */}
      {(error || success) && (
        <div className="mt-2 flex items-start space-x-1">
          {error && (
            <>
              <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p id={`${name}-error`} className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                {error}
              </p>
            </>
          )}
          {success && !error && (
            <>
              <Check className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                {success}
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Hint Text */}
      {hint && !error && !success && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-gray-500 sm:text-sm">
          {hint}
        </p>
      )}
    </div>
  );
};

interface CrudFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export const CrudForm: React.FC<CrudFormProps> = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};

// Responsive Grid Component
interface FormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  className = '',
}) => {
  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Form Section Component
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 sm:text-xl">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidthOnMobile?: boolean;
  sticky?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  disabled = false,
  fullWidthOnMobile = true,
  sticky = false,
}) => {
  const containerClasses = `
    ${sticky ? 'sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:border-t-0 sm:p-0 z-10 shadow-lg sm:shadow-none' : ''}
    ${fullWidthOnMobile ? 'flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3' : 'flex justify-end space-x-3'}
    mt-6 pt-4 ${!sticky ? 'border-t border-gray-200' : ''}
  `;

  const buttonBaseClasses = `
    inline-flex justify-center items-center px-4 py-3 sm:py-2 text-sm sm:text-base font-medium rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidthOnMobile ? 'w-full sm:w-auto' : ''}
  `;

  const cancelButtonClasses = `
    ${buttonBaseClasses}
    text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500
    active:bg-gray-100
  `;

  const submitButtonClasses = `
    ${buttonBaseClasses}
    text-white bg-indigo-600 border border-transparent hover:bg-indigo-700 focus:ring-indigo-500
    active:bg-indigo-800 
    ${loading ? 'cursor-wait' : ''}
  `;

  return (
    <div className={containerClasses}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={cancelButtonClasses}
        >
          {cancelText}
        </button>
      )}
      <button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={loading || disabled}
        className={submitButtonClasses}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {loading ? 'Saving...' : submitText}
      </button>
    </div>
  );
};

// Confirmation dialog component
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg  max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${typeStyles[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};