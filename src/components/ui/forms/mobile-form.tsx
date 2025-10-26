/**
 * Mobile Form Container Component
 * Responsive form container with mobile optimizations
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'

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
