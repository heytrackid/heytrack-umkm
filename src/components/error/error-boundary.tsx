'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    reset: () => void
  }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Here you could send to error monitoring service like Sentry
    // Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={this.handleReset}
          />
        )
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Oops! Terjadi Kesalahan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>Maaf, aplikasi mengalami masalah tak terduga.</p>
                <p>Tim kami sudah diberitahu dan akan segera memperbaikinya.</p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-4 rounded-md text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detail Error (Development)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ke Dashboard
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Error ID: {Date.now().toString(36)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Utility hook untuk error handling dalam functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack: string }) => {
    console.error('Handled Error:', error)
    // Here you could send to error monitoring service
    // Sentry.captureException(error, { extra: errorInfo })
  }
}

// Higher-order component untuk wrapping components dengan error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorFallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  const WrappedComponent = (props: T) => {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}