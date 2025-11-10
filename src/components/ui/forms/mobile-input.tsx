'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'


/**
 * Mobile Input Component
 * Optimized input field for mobile devices with password toggle
 */


interface MobileInputProps {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  type?: 'date' | 'email' | 'number' | 'password' | 'tel' | 'text' | 'url'
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  className?: string
  showPasswordToggle?: boolean
}

export const MobileInput = ({
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
  showPasswordToggle = false
}: MobileInputProps) => {
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
      case 'date': return 'text'
      case 'text': return 'text'
      case 'password': return 'text'
      default: return 'text'
    }
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

      <div className="relative">
        <Input
          type={inputType}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          disabled={disabled}
          required={required}
          inputMode={getInputMode()}
          className={cn(
            "transition-all duration-200 pr-10",
            isMobile && "text-base h-12", // Better readability on mobile
            error && "border-destructive focus-visible:ring-destructive",
            isFocused && "ring-2 ring-ring ring-offset-2"
          )}
        />

        {/* Password toggle */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Hint or Error message */}
      {(hint ?? error) && (
        <p className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
