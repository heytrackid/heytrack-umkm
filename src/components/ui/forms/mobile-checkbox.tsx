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

  const checkboxProps: Record<string, unknown> = {}
  if (checked !== undefined) checkboxProps['checked'] = checked
  if (defaultChecked !== undefined) checkboxProps['defaultChecked'] = defaultChecked
  if (onChange !== undefined) checkboxProps['onCheckedChange'] = onChange
  if (disabled !== undefined) checkboxProps['disabled'] = disabled
  if (required !== undefined) checkboxProps['required'] = required

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-3">
    <Checkbox
      {...checkboxProps}
      className={className}
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
