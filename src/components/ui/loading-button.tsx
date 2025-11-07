'use client'

import { Loader2 } from 'lucide-react'
import { forwardRef, type ComponentProps, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Haptic feedback utility for mobile devices
const triggerHapticFeedback = (type: 'heavy' | 'light' | 'medium' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    try {
      if ('vibrate' in navigator) {
        const patterns: Record<string, number[]> = {
          light: [10],
          medium: [20],
          heavy: [30]
        }
        const pattern = patterns[type] ?? [10]
        navigator.vibrate(pattern)
      }
      else if ('hapticFeedback' in (window as Window & { hapticFeedback?: { impact: (type: string) => void } })) {
        const hapticTypes: Record<string, string> = {
          light: 'impactLight',
          medium: 'impactMedium',
          heavy: 'impactHeavy'
        }
        ;(window as Window & { hapticFeedback?: { impact: (type: string) => void } }).hapticFeedback?.impact(hapticTypes[type] ?? 'impactLight')
      }
    } catch {
      // Silently fail if haptic feedback is not supported
    }
  }
}

export interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
  hapticFeedback?: boolean
  hapticType?: 'heavy' | 'light' | 'medium'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    loading,
    loadingText,
    children,
    disabled,
    className,
    hapticFeedback = false,
    hapticType = 'light',
    onClick,
    ...props
  }, ref) => {
    const [internalLoading, setInternalLoading] = useState(false)
    const isLoading = loading ?? internalLoading

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {return}

      // Trigger haptic feedback
      if (hapticFeedback) {
        triggerHapticFeedback(hapticType)
      }

      // Handle async onClick
      if (onClick) {
        try {
          setInternalLoading(true)
          await onClick(event)
        } finally {
          setInternalLoading(false)
        }
      }
    }

    return (
      <Button
        ref={ref}
        disabled={disabled ?? isLoading}
        className={cn(
          className,
          // Add subtle scale animation for better feedback
          !isLoading && !disabled && "active:scale-95 transition-transform duration-75"
        )}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText ?? 'Memuat...'}
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'
