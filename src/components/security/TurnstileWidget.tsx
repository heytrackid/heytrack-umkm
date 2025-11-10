'use client'

import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: (error: Error) => void
  onExpire?: () => void
  className?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className,
  theme = 'auto',
  size = 'normal',
}: TurnstileWidgetProps) {
  const siteKey = process.env['NEXT_PUBLIC_TURNSTILE_SITE_KEY']

  if (!siteKey) {
    console.warn('Turnstile site key not configured')
    return null
  }

  return (
    <div className={className}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={(error) => {
          console.error('Turnstile error:', error)
          onError?.(new Error('CAPTCHA verification failed'))
        }}
        onExpire={() => {
          console.warn('Turnstile token expired')
          onExpire?.()
        }}
        options={{
          theme,
          size,
          action: 'submit',
          appearance: 'always',
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
