import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

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

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  hapticFeedback = false,
  hapticType = 'light',
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    hapticFeedback?: boolean
    hapticType?: 'heavy' | 'light' | 'medium'
  }) {
  const Comp = asChild ? Slot : "button"

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback) {
      triggerHapticFeedback(hapticType)
    }
    props.onClick?.(event)
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      onClick={handleClick}
    />
  )
}

export { Button, buttonVariants }
