"use client";

import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error:', error);
      if (error.digest) {
        console.error('Error Digest:', error.digest);
      }
    }

    // In production, you could send to your own error reporting service
    // Example: sendToErrorReporting(error)
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            We're sorry, but an unexpected error occurred. Please try refreshing the page.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details style={{ textAlign: 'left', marginTop: '2rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '1rem',
                fontSize: '0.875rem',
                overflow: 'auto'
              }}>
                {error.toString()}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}