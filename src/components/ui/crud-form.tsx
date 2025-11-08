 
'use client'

import { AlertCircle, Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onChange' | 'value'> {
  label: string;
  name: string;
  type?: 'date' | 'datetime-local' | 'email' | 'number' | 'password' | 'select' | 'tel' | 'text' | 'textarea' | 'url';
  value?: unknown;
  onChange?: (name: string, value: unknown) => void;
  onBlur?: (name: string) => void;
  error?: string | undefined;
  success?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: number | string; label: string }>;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  hint?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const FormField = (props: FormFieldProps) => {
  const {
    label,
    name,
    type = 'text',
    value: _propValue,
    onChange: propOnChange,
    onBlur: propOnBlur,
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
    // Extract react-hook-form specific props if present
    onChange: _rhfOnChange,
    onBlur: _rhfOnBlur,
    value: _rhfValue,
    ...restProps
  } = props;

  // Determine if we're using react-hook-form by checking for its props
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);
  const isPassword = type === 'password';

  const baseInputClasses = `
    block w-full rounded-lg border transition-all duration-200 ease-in-out
    text-sm sm:text-base
    px-3 py-3 sm:px-4 sm:py-3
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground
    ${focused ? 'ring-2 ring-offset-1' : ''}
  `;

  const getInputClasses = () => {
    if (hasError) {
      return `${baseInputClasses} border-destructive text-foreground placeholder-muted-foreground focus:ring-destructive focus:border-destructive bg-background`;
    }
    if (hasSuccess) {
      return `${baseInputClasses} border-border text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary bg-background`;
    }
    return `${baseInputClasses} border-input text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring hover:border-ring bg-background`;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let newValue: unknown = e.target.value;

    if (type === 'number') {
      newValue = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
    }

    if (propOnChange !== undefined) {
      propOnChange(name, newValue);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    if (propOnBlur !== undefined) {
      propOnBlur(name);
    }
  };

  const handleFocus = () => {
    setFocused(true);
  };

  // Prepare specific props for each element type to avoid type conflicts
  const commonInputProps = {
    id: name,
    name,
    placeholder,
    disabled,
    'aria-invalid': hasError,
    'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ...restProps
  };

  const inputSpecificProps = {
    ...commonInputProps,
    className: getInputClasses(),
    onChange: handleChange,
  };

  const textareaSpecificProps = {
    ...commonInputProps,
    className: `${getInputClasses()} resize-vertical min-h-[80px] ${icon ? 'pl-10' : ''}`,
    rows,
    onChange: handleChange,
  } as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>;

  const selectSpecificProps = {
    ...commonInputProps,
    className: `${getInputClasses()} appearance-none pr-10 ${icon ? 'pl-10' : ''}`,
    onChange: handleChange,
  } as unknown as React.SelectHTMLAttributes<HTMLSelectElement>;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4 sm:mb-6`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-foreground sm:text-base"
        >
          {label}
          {required && <span className="text-muted-foreground ml-1" aria-label="required">*</span>}
        </label>
        {hint && !error && !success && (
          <span className="text-xs text-muted-foreground sm:text-sm">{hint}</span>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Input Field */}
        {type === 'textarea' ? (
          <textarea
            {...textareaSpecificProps}
          />
        ) : (
          type === 'select' ? (
            <div className="relative">
              <select
                {...selectSpecificProps}
              >
                <option value="" disabled>
                  {placeholder ?? "Pilih opsi"}
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <input
              {...inputSpecificProps}
              type={isPassword && showPassword ? 'text' : type}
              min={min}
              max={max}
              step={step}
            />
          )
        )}

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Success Icon */}
        {hasSuccess && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Check className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Error Icon */}
        {hasError && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>

      {/* Help Text */}
      {(error ?? success) && (
        <div className="mt-2 flex items-start space-x-1">
          {error && (
            <>
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p id={`${name}-error`} className="text-sm text-destructive flex-1">
                {error}
              </p>
            </>
          )}
          {success && !error && (
            <>
              <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground flex-1">
                {success}
              </p>
            </>
          )}
        </div>
      )}

      {/* Hint Text */}
      {hint && !error && !success && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {hint}
        </p>
      )}
    </div>
  );
};

interface CrudFormProps {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  className?: string;
}

export const CrudForm = ({ onSubmit, children, className = '' }: CrudFormProps) => (
  <form onSubmit={onSubmit} className={className}>
    {children}
  </form>
);

// Responsive Grid Component
interface FormGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'lg' | 'md' | 'sm';
  className?: string;
}

export const FormGrid = ({
  children,
  cols = 1,
  gap = 'md',
  className = '',
}: FormGridProps) => {
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
  children: ReactNode;
  className?: string;
}

export const FormSection = ({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) => (
  <div className={`space-y-4 sm:space-y-6 ${className}`}>
    {(title ?? description) && (
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

export const FormActions = ({
  onCancel,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  disabled = false,
  fullWidthOnMobile = true,
  sticky = false,
}: FormActionsProps) => {
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
  type?: 'danger' | 'info' | 'warning';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmDialogProps) => {
  if (!isOpen) { return null; }

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-gray-600 hover:bg-blue-700 focus:ring-blue-500',
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
