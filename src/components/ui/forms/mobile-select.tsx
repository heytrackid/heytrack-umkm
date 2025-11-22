import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/**
 * Mobile Select Component
 * Optimized select dropdown for mobile devices
 */


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

export const MobileSelect = ({
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
}: MobileSelectProps) => {
  const { isMobile } = useResponsive()

  const selectProps: any = {}
  if (value !== undefined) selectProps.value = value
  if (defaultValue !== undefined) selectProps.defaultValue = defaultValue
  if (onChange !== undefined) selectProps.onValueChange = onChange
  if (disabled !== undefined) selectProps.disabled = disabled
  if (required !== undefined) selectProps.required = required

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

    <Select
      {...selectProps}
    >
        <SelectTrigger
          className={cn(
            "transition-all duration-200",
            isMobile && "h-12 text-base",
            error && "border-destructive focus:ring-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(isMobile && "text-base py-3")}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
