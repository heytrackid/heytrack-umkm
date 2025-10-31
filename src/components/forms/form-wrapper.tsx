'use client'

import { type ReactNode, type FormHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface FormWrapperProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onError'> {
  children: ReactNode
  isLoading?: boolean
  error?: string | null
  onError?: (error: Error) => void
}

/**
 * FormWrapper - Unified form component with consistent error handling
 */
export const FormWrapper = forwardRef<HTMLFormElement, FormWrapperProps>(
  ({ children, isLoading, error, className, onError, ...props }, ref) => (
      <form ref={ref} className={cn('space-y-6', className)} {...props}>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className={cn(isLoading && 'opacity-50 pointer-events-none')}>
          {children}
        </div>
      </form>
    )
)

FormWrapper.displayName = 'FormWrapper'
