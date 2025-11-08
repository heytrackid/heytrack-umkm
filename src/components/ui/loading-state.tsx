import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'lg' | 'md' | 'sm'
  className?: string
}

export const LoadingState = ({ message = 'Memuat...', size = 'md', className }: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const currentSizeClass = sizeClasses[size]

  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Loader2 className={cn('animate-spin text-primary', currentSizeClass || 'h-8 w-8')} />
      {message && <p className="mt-2 text-sm text-muted-foreground">Memuat konten...</p>}
    </div>
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