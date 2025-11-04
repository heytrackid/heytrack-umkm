'use client'

import { useEffect, useRef } from 'react'
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
    onloadTurnstileCallback?: () => void
    onTurnstileSuccess?: (token: string) => void
    onTurnstileError?: () => void
    onTurnstileExpired?: () => void
  }
}

const TurnstileWidget = ({
  onVerify,
  onError,
  onExpire,
  siteKey,
  options = {}
}: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbacksRef = useRef({ onVerify, onError, onExpire })

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire }
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com"]')
    if (existingScript) {
      return
    }

    // Load the Turnstile script for implicit rendering
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true

    document.head.appendChild(script)

    return () => {
      // Don't remove script on cleanup to allow reuse
    }
  }, [])

  // Set up global callbacks for implicit rendering
  useEffect(() => {
    // Define global callback functions for implicit rendering
    window.onTurnstileSuccess = (token: string) => {
      logger.debug('Turnstile verification successful')
      callbacksRef.current.onVerify(token)
    }

    window.onTurnstileError = () => {
      logger.error('Turnstile verification error')
      callbacksRef.current.onError?.()
    }

    window.onTurnstileExpired = () => {
      logger.warn('Turnstile token expired')
      callbacksRef.current.onExpire?.()
    }

    return () => {
      // Clean up global callbacks
      delete window.onTurnstileSuccess
      delete window.onTurnstileError
      delete window.onTurnstileExpired
    }
  }, [])

  const theme = options?.theme ?? 'auto'
  const size = options?.size ?? 'normal'

  return (
    <div
      ref={containerRef}
      className="cf-turnstile"
      data-sitekey={siteKey}
      data-theme={theme}
      data-size={size}
      data-callback="onTurnstileSuccess"
      data-error-callback="onTurnstileError"
      data-expired-callback="onTurnstileExpired"
    />
  )
}

export default TurnstileWidget
