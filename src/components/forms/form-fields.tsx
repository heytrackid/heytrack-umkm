'use client'

import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'



interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
  className?: string
}

interface FormInputProps extends FormFieldProps, InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

/**
 * FormInput - Reusable input field with error handling
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, helperText, className, ...props }, ref) => {
    const id = props.id ?? props.name
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={id}
          className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-500 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

interface FormTextareaProps extends FormFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

/**
 * FormTextarea - Reusable textarea field with error handling
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, helperText, className, ...props }, ref) => {
    const id = props.id ?? props.name
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}>
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={id}
          className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-500 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

interface FormSelectProps extends FormFieldProps {
  label?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options: Array<{ value: string; label: string }>
  disabled?: boolean
}

/**
 * FormSelect - Reusable select field with error handling
 */
export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ label, error, required, helperText, className, options, onValueChange, placeholder, value, disabled }, ref) => {
    const id = `select-${Math.random().toString(36).substr(2, 9)}`
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}>
            {label}
          </Label>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={id}
            ref={ref}
            className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-500 font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'

interface FormFieldsContainerProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

/**
 * FormFieldsContainer - Layout wrapper for form fields with grid support
 */
export const FormFieldsContainer = ({
  children,
  columns = 1,
  className,
}: FormFieldsContainerProps) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns]

  return (
    <div className={cn(`grid gap-6 ${colsClass}`, className)}>
      {children}
    </div>
  )
}

FormFieldsContainer.displayName = 'FormFieldsContainer'
