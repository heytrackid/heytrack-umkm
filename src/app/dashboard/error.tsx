'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log dashboard errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error:', error)
    }
  }, [error])

  const handleLogout = () => {
    // Clear any cached data and redirect to login
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">
              Dashboard Error
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            There was a problem loading the dashboard. This might be due to a temporary issue.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-muted rounded-lg">
              <summary className="cursor-pointer font-medium text-sm mb-2">
                Error Details (Development Only)
              </summary>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Error:</strong>
                  <pre className="mt-1 p-2 bg-background rounded overflow-auto">
                    {error.toString()}
                  </pre>
                </div>
                {error.digest && (
                  <div>
                    <strong>Digest:</strong>
                    <code className="bg-background px-2 py-1 rounded">
                      {error.digest}
                    </code>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button onClick={() => reset()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full col-span-2">
              <LogOut className="h-4 w-4 mr-2" />
              Logout & Login Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
