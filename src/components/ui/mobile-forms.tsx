'use client'
import * as React from 'react'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/use-mobile'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Checkbox } from './checkbox'
import { Minus, Plus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

// Base form container
interface MobileFormProps {
  children: React.ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
}

export function MobileForm({ children, className, onSubmit }: MobileFormProps) {
  const { isMobile } = useResponsive()

  return (
    <form 
      onSubmit={onSubmit}
      className={cn(
       "space-y-6",
        isMobile &&"space-y-5",
        className
      )}
    >
      {children}
    </form>
  )
}

// Mobile Input Field
interface MobileInputProps {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date'
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  className?: string
  showPasswordToggle?: boolean
  multiline?: boolean
  rows?: number
}

export function MobileInput({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  type = 'text',
  required,
  disabled,
  error,
  hint,
  className,
  showPasswordToggle = false,
  multiline = false,
  rows = 4
}: MobileInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useResponsive()

  const inputType = type === 'password' && showPassword ? 'text' : type

  // Enhanced keyboard attributes for mobile
  const getInputMode = () => {
    switch (type) {
      case 'email': return 'email'
      case 'tel': return 'tel'
      case 'url': return 'url'
      case 'number': return 'decimal'
      default: return 'text'
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          className={cn(
           "text-sm font-medium",
            isMobile &&"text-base",
            error &&"text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {multiline ? (
          <Textarea
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              onBlur?.()
            }}
            disabled={disabled}
            required={required}
            rows={rows}
            className={cn(
             "transition-all duration-200 resize-none",
              isMobile &&"text-base",
              error &&"border-destructive focus-visible:ring-destructive",
              isFocused &&"ring-2 ring-ring ring-offset-2"
            )}
          />
        ) : (
          <Input
            type={inputType}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              onBlur?.()
            }}
            disabled={disabled}
            required={required}
            inputMode={getInputMode()}
            className={cn(
             "transition-all duration-200",
              isMobile &&"h-12 text-base", // Larger touch targets on mobile
              error &&"border-destructive focus-visible:ring-destructive",
              isFocused &&"ring-2 ring-ring ring-offset-2"
            )}
          />
        )}
        
        {/* Password toggle */}
        {showPasswordToggle && type === 'password' && !multiline && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Error/Success indicator */}
        {(error || (!error && value && isFocused)) && !multiline && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Hint or Error message */}
      {(hint || error) && (
        <p className={cn(
         "text-sm",
          error ?"text-destructive" :"text-muted-foreground"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

// Mobile Textarea
interface MobileTextareaProps {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  rows?: number
  maxLength?: number
  className?: string
}

export function MobileTextarea({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  required,
  disabled,
  error,
  hint,
  rows = 4,
  maxLength,
  className
}: MobileTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useResponsive()
  const currentLength = value?.length || defaultValue?.length || 0

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          className={cn(
           "text-sm font-medium",
            isMobile &&"text-base",
            error &&"text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          disabled={disabled}
          required={required}
          rows={isMobile ? Math.max(rows, 3) : rows}
          maxLength={maxLength}
          className={cn(
           "transition-all duration-200 resize-none",
            isMobile &&"text-base", // Better readability on mobile
            error &&"border-destructive focus-visible:ring-destructive",
            isFocused &&"ring-2 ring-ring ring-offset-2"
          )}
        />
      </div>

      {/* Character count and hint/error */}
      <div className="flex justify-between items-start">
        <p className={cn(
         "text-sm",
          error ?"text-destructive" :"text-muted-foreground"
        )}>
          {error || hint}
        </p>
        
        {maxLength && (
          <span className={cn(
           "text-xs",
            currentLength > maxLength * 0.9 ?"text-destructive" :"text-muted-foreground"
          )}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

// Mobile Number Input with +/- buttons
interface MobileNumberInputProps {
  label?: string
  placeholder?: string
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  onBlur?: () => void
  min?: number
  max?: number
  step?: number
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  formatCurrency?: boolean
  className?: string
}

export function MobileNumberInput({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  required,
  disabled,
  error,
  hint,
  formatCurrency = false,
  className
}: MobileNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useResponsive()

  const currentValue = value ?? defaultValue ?? 0

  const handleIncrement = () => {
    const newValue = currentValue + step
    if (max === undefined || newValue <= max) {
      onChange?.(newValue)
    }
  }

  const handleDecrement = () => {
    const newValue = currentValue - step
    if (min === undefined || newValue >= min) {
      onChange?.(newValue)
    }
  }

  const handleInputChange = (inputValue: string) => {
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      onChange?.(numValue)
    } else if (inputValue === '') {
      onChange?.(0)
    }
  }

  const formatValue = (val: number) => {
    if (formatCurrency) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(val)
    }
    return val.toString()
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          className={cn(
           "text-sm font-medium",
            isMobile &&"text-base",
            error &&"text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative flex items-center">
        {/* Decrement button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || (min !== undefined && currentValue <= min)}
          onClick={handleDecrement}
          className={cn(
           "h-10 w-10 rounded-r-none border-r-0 p-0 shrink-0",
            isMobile &&"h-12 w-12"
          )}
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Number input */}
        <Input
          type="number"
          placeholder={placeholder}
          value={currentValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          inputMode="decimal"
          className={cn(
           "flex-1 rounded-none text-center transition-all duration-200",
            isMobile &&"h-12 text-base",
            error &&"border-destructive focus-visible:ring-destructive",
            isFocused &&"ring-2 ring-ring ring-offset-2"
          )}
        />

        {/* Increment button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || (max !== undefined && currentValue >= max)}
          onClick={handleIncrement}
          className={cn(
           "h-10 w-10 rounded-l-none border-l-0 p-0 shrink-0",
            isMobile &&"h-12 w-12"
          )}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Formatted value display */}
      {formatCurrency && currentValue > 0 && (
        <p className="text-sm text-muted-foreground">
          {formatValue(currentValue)}
        </p>
      )}

      {/* Hint or Error message */}
      {(hint || error) && (
        <p className={cn(
         "text-sm",
          error ?"text-destructive" :"text-muted-foreground"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

// Mobile Select
interface MobileSelectProps {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  options: Array<{ value: string; label: string }>
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  className?: string
}

export function MobileSelect({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  options,
  required,
  disabled,
  error,
  hint,
  className
}: MobileSelectProps) {
  const { isMobile } = useResponsive()

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          className={cn(
           "text-sm font-medium",
            isMobile &&"text-base",
            error &&"text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger 
          className={cn(
           "transition-all duration-200",
            isMobile &&"h-12 text-base",
            error &&"border-destructive focus:ring-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={cn(isMobile &&"text-base py-3")}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Hint or Error message */}
      {(hint || error) && (
        <p className={cn(
         "text-sm",
          error ?"text-destructive" :"text-muted-foreground"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

// Mobile Checkbox
interface MobileCheckboxProps {
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  className?: string
}

export function MobileCheckbox({
  label,
  checked,
  defaultChecked,
  onChange,
  required,
  disabled,
  error,
  hint,
  className
}: MobileCheckboxProps) {
  const { isMobile } = useResponsive()

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
           "transition-all duration-200",
            isMobile &&"h-5 w-5", // Larger touch target on mobile
            error &&"border-destructive data-[state=checked]:bg-destructive"
          )}
        />
        {label && (
          <Label 
            className={cn(
             "text-sm font-medium cursor-pointer",
              isMobile &&"text-base",
              error &&"text-destructive",
              disabled &&"opacity-50 cursor-not-allowed"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
      </div>

      {/* Hint or Error message */}
      {(hint || error) && (
        <p className={cn(
         "text-sm ml-8", // Align with checkbox label
          error ?"text-destructive" :"text-muted-foreground"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}