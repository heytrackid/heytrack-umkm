'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { uiLogger } from '@/lib/logger'

/**
 * Global error boundary for the application
 * Catches and displays errors gracefully
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error for debugging
        uiLogger.error({ error, digest: error.digest, msg: 'Application error occurred' })

        // TODO: Send to error tracking service (e.g., Sentry)
        // logErrorToService(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <CardTitle>Terjadi Kesalahan</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang menangani masalah ini.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-xs font-mono text-destructive break-all">
                                {error.message}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={reset} className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Coba Lagi
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex-1"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Ke Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
