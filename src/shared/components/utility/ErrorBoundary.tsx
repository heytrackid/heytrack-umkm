'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo
    })

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-destructive mb-2">
                Terjadi Kesalahan
              </h3>
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message || 'Terjadi kesalahan yang tidak terduga.'}
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => console.log(this.state.error, this.state.errorInfo)}
                    className="gap-2"
                  >
                    <Bug className="h-4 w-4" />
                    Debug
                  </Button>
                )}
              </div>
              
              {/* Development mode: Show error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Detail Error (Development Only)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-64">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)
  
  const resetError = React.useCallback(() => {
    setError(null)
  }, [])
  
  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])
  
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])
  
  return { captureError, resetError }
}