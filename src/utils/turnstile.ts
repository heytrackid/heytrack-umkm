'use server'

import { apiLogger } from '@/lib/logger'
import { withPerformanceMonitoring } from '@/middleware/performance'
import { headers } from 'next/headers'

// Function to verify Turnstile token on the server side
export async function verifyTurnstileToken(token: string): Promise<{ success: boolean; error?: string }> {
  return withPerformanceMonitoring('turnstile:verify', async () => {
    if (!process.env.TURNSTILE_SECRET_KEY) {
      apiLogger.error({ token }, 'TURNSTILE_SECRET_KEY is not set in environment variables')
      return { success: false, error: 'Captcha verification is not properly configured' }
    }

    try {
      // Get client IP for enhanced security verification
      const headersList = await headers()
      const clientIP = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? ''

      const formData = new FormData()
      formData.append('secret', process.env.TURNSTILE_SECRET_KEY)
      formData.append('response', token)
      
      // Include client IP for enhanced security (optional but recommended)
      if (clientIP) {
        // Extract just the first IP if multiple are present
        const ip = clientIP.split(',')[0].trim()
        formData.append('remoteip', ip)
      }

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
        token,
        clientIP
      }, 'Turnstile verification failed')
      
      return { 
        success: false, 
        error: `Captcha verification failed: ${data['error-codes']?.join(', ') ?? 'Unknown error'}` 
      }
    } catch (error) {
      apiLogger.error({ error, token }, 'Error verifying Turnstile token')
      return { success: false, error: 'Failed to verify captcha' }
    }
  })
}