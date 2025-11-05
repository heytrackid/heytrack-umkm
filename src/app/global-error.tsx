'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    // Kirim error ke Sentry untuk tracking
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ color: '#666', maxWidth: '28rem' }}>
              Maaf, terjadi kesalahan pada aplikasi. Silakan muat ulang halaman
              atau hubungi dukungan.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.875rem', color: '#999' }}>
                Kode Error: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
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
