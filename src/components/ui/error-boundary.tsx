'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="max-w-lg mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Terjadi Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">
              <p>Maaf, terjadi kesalahan yang tidak terduga.</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Detail error (untuk developer)</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error?.message}
                </pre>
              </details>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => this.setState({ hasError: false })}
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                size="sm"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Error Fallback Component untuk digunakan dengan library lain
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error
  resetErrorBoundary: () => void 
}) {
  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Terjadi Kesalahan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground">
          <p>Maaf, terjadi kesalahan yang tidak terduga saat memuat halaman.</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm">Detail error (untuk developer)</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            size="sm"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Beranda
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Error State Component
export function LoadingError({ 
  message ="Gagal memuat data",
  onRetry,
  isRetrying = false
}: { 
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
}) {
  const { t } = useI18n()
  
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="py-8 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <div>
          <h3 className="font-medium text-red-600 mb-1">{t('common.error')}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            size="sm"
          >
            {isRetrying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                {t('common.retrying')}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.retry')}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
