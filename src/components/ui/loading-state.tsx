import { Loader2 } from '@/components/icons'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'lg' | 'md' | 'sm'
  className?: string
}

export const LoadingState = ({ message, size = 'md', className }: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const currentSizeClass = sizeClasses[size]

  return (
    <div className={cn('flex flex-col items-center justify-center py-8', className)}>
      <Skeleton className={cn('rounded-full', currentSizeClass || 'h-8 w-8')} />
      {message && (
        <p className="mt-3 text-sm text-muted-foreground text-center">
          {message}
        </p>
      )}
    </div>
  )
}

// Consistent LoadingSpinner component for inline usage
interface LoadingSpinnerProps {
  size?: 'lg' | 'md' | 'sm' | 'xs'
  className?: string
  color?: 'primary' | 'muted' | 'foreground'
}

export const LoadingSpinner = ({ size = 'md', className, color = 'primary' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const colorClasses = {
    primary: 'text-primary',
    muted: 'text-muted-foreground',
    foreground: 'text-foreground'
  }

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)} />
  )
}

interface SuspenseLoaderProps {
  children: React.ReactNode
  fallbackMessage?: string
}

export const SuspenseLoader = ({ children }: SuspenseLoaderProps) => <>{children}</>

// Default fallback for React.Suspense
export const DefaultSuspenseFallback = ({ message }: { message?: string } = {}) => (
  <LoadingState message={message ?? 'Memuat komponen...'} />
)