import { type FormEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'

/**
 * Mobile Form Container Component
 * Responsive form container with mobile optimizations
 */


interface MobileFormProps {
  children: ReactNode
  className?: string
  onSubmit?: (e: FormEvent) => void
}

export const MobileForm = ({ children, className, onSubmit }: MobileFormProps) => {
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
