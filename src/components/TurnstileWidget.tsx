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
    action?: string  // For analytics purposes
    cData?: string  // Additional data to send with verification
  }
}

const logger = createClientLogger('TurnstileWidget')

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void
    turnstile?: {
      render: (container: string | HTMLElement, params: {
        sitekey: string;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
        action?: string;
        cData?: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
      }) => string
      remove: (widgetId: string) => void
    }
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
  const widgetIdRef = useRef<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!containerRef.current) {return}

    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    const loadScriptAndWidget = () => {
      // Check if script is already loaded
      if (window.turnstile) {
        if (!isCancelled) {
          renderTurnstileWidget();
          setIsLoaded(true);
        }
        return
      }

      // Check if script element already exists
      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]')
      if (existingScript) {
        // Wait for the existing script to be ready with timeout
        timeoutId = setTimeout(() => {
          if (!window.turnstile && !isCancelled) {
            logger.error('Turnstile script did not load within expected time');
            setHasError(true);
          }
        }, 5000); // 5 second timeout

        const checkForTurnstile = () => {
          if (window.turnstile && !isCancelled) {
            clearTimeout(timeoutId);
            renderTurnstileWidget();
            setIsLoaded(true);
          } else if (!isCancelled) {
            setTimeout(checkForTurnstile, 100)
          }
        }
        checkForTurnstile()
        return
      }

      // Define the callback BEFORE loading the script
      window.onloadTurnstileCallback = () => {
        if (!isCancelled) {
          renderTurnstileWidget();
          setIsLoaded(true);
        }
      }

      // Load the Turnstile script dynamically with explicit rendering
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback'
      script.async = true
      script.defer = false // Change to false to ensure it runs immediately when loaded

      // Add error handling for script loading
      script.onerror = () => {
        if (!isCancelled) {
          logger.error('Failed to load Turnstile script');
          setHasError(true);
        }
      }

      document.head.appendChild(script)
    }

    const renderTurnstileWidget = () => {
      if (!containerRef.current || !window.turnstile || isCancelled) {return}

      // Clean up any existing widget
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e)
          logger.warn({ error: errorMessage }, 'Could not remove existing turnstile widget')
        }
      }

      try {
        // Render the new widget with explicit rendering
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: options?.theme ?? 'auto',
          size: options?.size ?? 'normal',
          action: options?.action ?? 'login',
          cData: options?.cData ?? '',
          callback: (token: string) => {
            logger.debug('Turnstile verification successful')
            onVerify(token)
          },
          'error-callback': () => {
            logger.error('Turnstile verification error')
            onError?.()
          },
          'expired-callback': () => {
            logger.warn('Turnstile token expired')
            onExpire?.()
          }
        })

        widgetIdRef.current = widgetId
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error({ error: errorMessage }, 'Error rendering Turnstile widget');
        setHasError(true);
      }
    }

    loadScriptAndWidget();

    // Cleanup function
    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Clean up widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e)
          logger.warn({ error: errorMessage }, 'Could not remove turnstile widget on unmount')
        }
        widgetIdRef.current = null
      }
      
      // Only delete callback if it was set by this instance
      if (window.onloadTurnstileCallback) {
        // Don't delete if other instances might still need it
        // Just reset to a no-op function to be safe
        window.onloadTurnstileCallback = () => {};
      }
    }
  }, [siteKey, options?.theme, options?.size, options?.action, options?.cData, onVerify, onError, onExpire])

  if (hasError) {
    return (
      <div className="text-red-500 text-sm p-2">
        Failed to load security verification. Please check your ad blocker or refresh the page.
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300" />
        </div>
      )}
    </div>
  )
}

export default TurnstileWidget
