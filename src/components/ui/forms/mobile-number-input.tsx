import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'
import { Input } from '../input'
import { Label } from '../label'
import { Button } from '../button'
import { Minus, Plus } from 'lucide-react'

/**
 * Mobile Number Input Component
 * Optimized number input with +/- buttons for mobile
 */


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

export const MobileNumberInput = ({
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
}: MobileNumberInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useResponsive()

  const currentValue = value || defaultValue || 0

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
            isMobile && "text-base",
            error && "text-destructive"
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
            isMobile && "h-12 w-12"
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
            void setIsFocused(false)
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
            isMobile && "h-12 text-base",
            error && "border-destructive focus-visible:ring-destructive",
            isFocused && "ring-2 ring-ring ring-offset-2"
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
            isMobile && "h-12 w-12"
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
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
