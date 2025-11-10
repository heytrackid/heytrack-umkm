import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

/**
 * Mobile Checkbox Component
 * Optimized checkbox for mobile devices with larger touch targets
 */


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

export const MobileCheckbox = ({
  label,
  checked,
  defaultChecked,
  onChange,
  required,
  disabled,
  error,
  hint,
  className
}: MobileCheckboxProps) => {
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
            isMobile && "h-5 w-5", // Larger touch target on mobile
            error && "border-destructive data-[state=checked]:bg-destructive"
          )}
        />
        {label && (
          <Label
            className={cn(
              "text-sm font-medium cursor-pointer",
              isMobile && "text-base",
              error && "text-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
      </div>

      {/* Hint or Error message */}
      {(hint ?? error) && (
        <p className={cn(
          "text-sm ml-8", // Align with checkbox label
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
