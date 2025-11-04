'use client'

import { useEffect, useRef, useState } from 'react'
import { createClientLogger } from '@/lib/client-logger'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  siteKey: string
  options?: {
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'compact'
    language?: string
  }
}

const logger = createClientLogger('TurnstileWidget')

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: { 
        sitekey: string; 
        callback: (token: string) => void; 
        'error-callback'?: () => void; 
        'expired-callback'?: () => void; 
        theme?: string; 
        size?: string; 
        language?: string;
      }) => string
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string | null
    }
    onloadTurnstileCallback?: () => void
  }
}

const TurnstileWidget = ({ 
  onVerify, 
  onError, 
  onExpire, 
  siteKey, 
  options = {} 
}: TurnstileWidgetProps) => {
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<string | null>(null)
  const theme = options?.theme ?? 'auto'
  const size = options?.size ?? 'normal'
  const language = options?.language ?? 'auto'

  useEffect(() => {
    // Check if Turnstile script is already loaded
    if (typeof window !== 'undefined' && window.turnstile) {
      setLoaded(true)
      return
    }

    // Load the Turnstile script
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
    script.async = true
    script.defer = true

    // Create a global callback function for when Turnstile loads
    window.onloadTurnstileCallback = () => {
      setLoaded(true)
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
      if (widgetRef.current) {
        try {
          window.turnstile?.reset?.(widgetRef.current)
        } catch (_e) {
          // Widget may have already been destroyed
        }
      }
      delete window.onloadTurnstileCallback
    }
  }, [])

  useEffect(() => {
    if (loaded && containerRef.current && !widgetRef.current) {
      // Render the widget only once
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token)
          },
          'error-callback': () => {
            onError?.()
          },
          'expired-callback': () => {
            onExpire?.()
          },
          theme,
          size,
          language,
        })
        widgetRef.current = id
      } catch (error) {
        logger.error({ error }, 'Error rendering Turnstile widget')
      }
    }

    return () => {
      if (widgetRef.current) {
        try {
          window.turnstile?.reset?.(widgetRef.current)
          widgetRef.current = null
        } catch (_e) {
          // Widget may have already been destroyed
        }
      }
    }
  }, [loaded, siteKey, onVerify, onError, onExpire, theme, size, language])

  // Function is kept for potential future use
  const _reset = () => {
    if (widgetRef.current) {
      try {
        window.turnstile?.reset?.(widgetRef.current)
      } catch (error) {
        logger.error({ error }, 'Error resetting Turnstile widget')
      }
    }
  }

  return (
    <div 
      ref={containerRef} 
      className="cf-turnstile"
      data-sitekey={siteKey}
    />
  )
}

export default TurnstileWidget
