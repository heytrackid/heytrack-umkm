'use server'

import { apiLogger } from '@/lib/logger'

// Function to verify Turnstile token on the server side
export async function verifyTurnstileToken(token: string): Promise<{ success: boolean; error?: string }> {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    apiLogger.error({ token }, 'TURNSTILE_SECRET_KEY is not set in environment variables')
    return { success: false, error: 'Captcha verification is not properly configured' }
  }

  try {
    const formData = new FormData()
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    // In a real implementation, you might also want to include the remote IP:
    // formData.append('remoteip', requestIp)

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      return { success: true }
    }
    
    apiLogger.warn({ 
      errorCodes: data['error-codes'], 
      token 
    }, 'Turnstile verification failed')
    
    return { 
      success: false, 
      error: `Captcha verification failed: ${data['error-codes']?.join(', ') ?? 'Unknown error'}` 
    }
  } catch (error) {
    apiLogger.error({ error, token }, 'Error verifying Turnstile token')
    return { success: false, error: 'Failed to verify captcha' }
  }
}