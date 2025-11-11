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

  if (!siteKey) {
    logger.error('Turnstile site key not configured')
    return (
      <div className={className}>
        <div className="text-sm text-destructive text-center p-4 border border-destructive rounded-md bg-destructive/10">
          ⚠️ Security configuration error. Please contact administrator.
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
          action: 'login', // More specific action for login forms
          appearance: 'always',
          retry: 'auto',
          retryInterval: 8000,
          refreshExpired: 'auto', // Auto-refresh expired tokens
          refreshTimeout: 'auto', // Auto-refresh on timeout
          feedbackEnabled: false, // Disable visitor feedback collection
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
