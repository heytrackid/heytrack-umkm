'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showDetails?: boolean
}

/**
 * Error Fallback Component
 * Standalone error display component for use with error boundaries
 * 
 * Usage in ErrorBoundary:
 * <ErrorBoundary fallback={<ErrorFallback />}>
 */
export function ErrorFallback({
  error,
  resetError,
  title = 'Oops! Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-red-100">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Error Details (Development Only) */}
        {showDetails && error && (
          <details className="mb-6 p-3 bg-gray-100 rounded-lg text-xs">
            <summary className="font-semibold text-gray-700 cursor-pointer mb-2 hover:text-gray-900">
              Error Details
            </summary>
            <pre className="overflow-auto text-gray-600 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {resetError && (
            <Button
              onClick={resetError}
              variant="default"
              size="sm"
              className="flex-1 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          If this problem persists, please contact support
        </p>
      </div>
    </div>
  )
}

/**
 * Not Found Error Fallback
 * Specific fallback for 404 errors
 */
export function NotFoundFallback() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-blue-100">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          404
        </h1>
        <p className="text-xl text-gray-600 text-center mb-2">
          Page Not Found
        </p>
        <p className="text-gray-500 text-center mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="default"
            size="sm"
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Server Error Fallback
 * Specific fallback for 500 errors
 */
export function ServerErrorFallback() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full border border-red-100">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          500
        </h1>
        <p className="text-xl text-gray-600 text-center mb-2">
          Server Error
        </p>
        <p className="text-gray-500 text-center mb-6">
          Something went wrong on our end. Our team has been notified and is working on a fix.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="default"
            size="sm"
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
