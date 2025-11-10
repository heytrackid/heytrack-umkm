'use client'

import { useState } from 'react'

import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * Mobile Textarea Component
 * Optimized textarea for mobile devices with character count
 */


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

export const MobileTextarea = ({
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
}: MobileTextareaProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const { isMobile } = useResponsive()
  const currentLength = value?.length ?? defaultValue?.length ?? 0

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
        <Textarea
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
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
            isMobile && "text-base", // Better readability on mobile
            error && "border-destructive focus-visible:ring-destructive",
            isFocused && "ring-2 ring-ring ring-offset-2"
          )}
        />
      </div>

      {/* Character count and hint/error */}
      <div className="flex justify-between items-start">
        <p className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error ?? hint}
        </p>

        {maxLength && (
          <span className={cn(
            "text-xs",
            currentLength > maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"
          )}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
