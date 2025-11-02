'use client'

import { forwardRef, type ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'



export interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, children, disabled, className, ...props }, ref) => (
    <Button
      ref={ref}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'Memuat...'}
        </>
      ) : (
        children
      )}
    </Button>
  )
)

LoadingButton.displayName = 'LoadingButton'
