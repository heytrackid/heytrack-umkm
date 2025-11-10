'use client'

import { useEffect } from 'react'

import { logError, logger } from '@/lib/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError = ({ error, reset }: GlobalErrorProps): JSX.Element => {
  useEffect(() => {
    // Log global error for debugging
    logError(logger, error, 'Global error occurred', { digest: error.digest ?? 'unknown' })
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 font-sans">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold">
              Terjadi Kesalahan
            </h2>
            <p className="text-muted-foreground max-w-md">
              Maaf, terjadi kesalahan pada aplikasi. Silakan muat ulang halaman
              atau hubungi dukungan.
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground">
                Kode Error: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

export default GlobalError
