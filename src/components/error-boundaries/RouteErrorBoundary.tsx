// Route-level Error Boundary
// Wraps individual routes/pages to isolate errors

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { apiLogger } from '@/lib/logger'

interface Props {
  children: ReactNode
  routeName?: string
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const routeName = this.props.routeName || 'Unknown Route'

    apiLogger.error({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: routeName
    }, `Route Error Boundary caught error in ${routeName}`)

    // Here you could send to error monitoring service
    // Example: Sentry.captureException(error, { tags: { route: routeName } })
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  override render() {
    if (this.state.hasError) {
      const routeName = this.props.routeName || 'this page'
      const maxRetries = 3

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Page Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                Something went wrong while loading {routeName}. This might be a temporary issue.
              </p>

              {this.state.retryCount < maxRetries && (
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again ({maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}

              <Button onClick={this.handleGoBack} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs">
                  <summary className="cursor-pointer text-gray-700 dark:text-gray-300 mb-2">
                    Error Details
                  </summary>
                  <div className="text-red-600 dark:text-red-400 font-mono">
                    {this.state.error.message}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping routes
export function withRouteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  routeName?: string
) {
  const WrappedComponent = (props: P) => (
    <RouteErrorBoundary routeName={routeName}>
      <Component {...props} />
    </RouteErrorBoundary>
  )

  WrappedComponent.displayName = `withRouteErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
