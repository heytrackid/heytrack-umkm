'use client'

import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('TurnstileWidget')

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: (error: Error) => void
  onExpire?: () => void
  className?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

export const TurnstileWidget = ({
  onVerify,
  onError,
  onExpire,
  className,
  theme = 'auto',
  size = 'normal',
}: TurnstileWidgetProps) => {
  const siteKey = process.env['NEXT_PUBLIC_TURNSTILE_SITE_KEY']
  const isDev = process.env.NODE_ENV === 'development'

  // Development bypass - auto-verify with dummy token
  if (isDev && !siteKey) {
    logger.info('Development mode: Bypassing Turnstile verification')
    
    // Auto-verify after a short delay to simulate real behavior
    setTimeout(() => {
      onVerify('dev-bypass-token')
    }, 100)

    return (
      <div className={className}>
        <div className="text-xs text-muted-foreground text-center p-2 border border-dashed border-border rounded-md bg-muted/50">
          🔧 Dev Mode: CAPTCHA Bypassed
        </div>
      </div>
    )
  }

  if (!siteKey) {
    logger.warn('Turnstile site key not configured')
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground text-center p-4 border border-border rounded-md">
          Turnstile not configured
        </div>
      </div>
    )
  }

  logger.info({ message: 'Rendering Turnstile widget', siteKey: `${siteKey.substring(0, 10)}...` })

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => {
          logger.info({ 
            message: 'Turnstile verification successful',
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20)
          })
          onVerify(token)
        }}
        onError={(error) => {
          logger.error({ 
            message: 'Turnstile error', 
            error,
            errorType: typeof error,
            errorString: String(error)
          })
          onError?.(new Error('CAPTCHA verification failed'))
        }}
        onExpire={() => {
          logger.warn('Turnstile token expired')
          onExpire?.()
        }}
        options={{
          theme,
          size,
          action: 'submit',
          appearance: 'always',
          retry: 'auto',
          retryInterval: 8000,
        }}
      />
    </div>
  )
}

// Hook untuk reset Turnstile
export function useTurnstileReset() {
  const [turnstileRef, setTurnstileRef] = useState<TurnstileInstance | null>(null)

  const reset = () => {
    turnstileRef?.reset()
  }

  return { setTurnstileRef, reset }
}
