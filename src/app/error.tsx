'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { uiLogger } from '@/lib/client-logger'

const Error = ({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) => {
    useEffect(() => {
        // Log error to monitoring service
        uiLogger.error({ 
            error: {
                message: error.message,
                name: error.name,
                stack: error.stack,
                digest: error.digest
            }
        }, 'Error boundary caught')
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-4 text-center">
                <AlertTriangle className="h-24 w-24 text-destructive" />
                <h2 className="text-2xl font-semibold">Terjadi Kesalahan</h2>
                <p className="text-muted-foreground max-w-md">
                    Maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi atau hubungi
                    dukungan jika masalah berlanjut.
                </p>
                {error.digest && (
                    <p className="text-sm text-muted-foreground">
                        Kode Error: {error.digest}
                    </p>
                )}
                <Button onClick={reset} className="mt-4">
                    Coba Lagi
                </Button>
            </div>
        </div>
    )
}

export default Error
