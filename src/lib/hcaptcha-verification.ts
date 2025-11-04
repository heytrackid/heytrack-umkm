'use server'

import { apiLogger } from '@/lib/logger'
import { HCAPTCHA_CONFIG } from '@/lib/config/hcaptcha'

interface HCaptchaVerificationResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  credit?: boolean
  'error-codes'?: string[]
  score?: number
  score_reason?: string[]
}

export async function verifyHCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'Token hCaptcha tidak ditemukan' }
  }

  try {
    // Check if hCaptcha is properly configured
    const configValidation = HCAPTCHA_CONFIG.secretKey 
      ? { isValid: true } 
      : { isValid: false, error: 'HCAPTCHA_SECRET_KEY tidak diatur untuk lingkungan produksi' }
    
    if (!configValidation.isValid) {
      if (process.env.NODE_ENV === 'production') {
        apiLogger.error({ configValidation }, 'Konfigurasi hCaptcha tidak valid untuk lingkungan produksi')
        return { success: false, error: configValidation.error }
      }
      // Di development, jika tidak ada secret key, skip verifikasi hCaptcha
      apiLogger.warn('HCAPTCHA_SECRET_KEY tidak diatur. Verifikasi hCaptcha dilewati dalam lingkungan development.')
      return { success: true }
    }

    const formData = new FormData()
    formData.append('secret', HCAPTCHA_CONFIG.secretKey ?? '')
    formData.append('response', token)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      apiLogger.warn({ timeout: HCAPTCHA_CONFIG.timeout }, 'hCaptcha verification timeout')
    }, HCAPTCHA_CONFIG.timeout)

    try {
      // Log the attempt
      apiLogger.debug({ 
        tokenLength: token.length, 
        endpoint: HCAPTCHA_CONFIG.verifyEndpoint,
        timeout: HCAPTCHA_CONFIG.timeout 
      }, 'Attempting hCaptcha verification')

      const response = await fetch(HCAPTCHA_CONFIG.verifyEndpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const { status, statusText } = response
        apiLogger.error({ status, statusText }, 'Respons tidak berhasil dari endpoint verifikasi hCaptcha')
        
        // Provide more descriptive error message based on status code
        let errorMessage = `Respons tidak berhasil dari server hCaptcha: ${statusText}`
        if (status === 401 || status === 403) {
          errorMessage = 'Kunci hCaptcha tidak valid. Harap periksa konfigurasi kunci Anda.'
        } else if (status === 429) {
          errorMessage = 'Terlalu banyak permintaan ke server hCaptcha. Silakan coba lagi nanti.'
        }
        
        return { success: false, error: errorMessage }
      }

      const result: HCaptchaVerificationResponse = await response.json()
      const errorCodes = result['error-codes']

      if (result.success) {
        apiLogger.info({ 
          challenge_ts: result.challenge_ts,
          hostname: result.hostname,
          credit: result.credit,
          score: result.score 
        }, 'Verifikasi hCaptcha berhasil')
        return { success: true }
      }
      
      const joinedErrorCodes = errorCodes?.join(', ') ?? 'error tidak diketahui'
      apiLogger.error({ errorCodes: joinedErrorCodes }, 'Verifikasi hCaptcha gagal')
      
      // Provide more user-friendly error messages based on error codes
      const errorMessages: Record<string, string> = {
        'missing-input-secret': 'Parameter rahasia hCaptcha tidak ditemukan. Harap hubungi admin.',
        'invalid-input-secret': 'Parameter rahasia hCaptcha tidak valid. Harap hubungi admin.',
        'missing-input-response': 'Token verifikasi tidak ditemukan. Silakan coba lagi.',
        'invalid-input-response': 'Token verifikasi tidak valid. Silakan coba lagi.',
        'bad-request': 'Permintaan verifikasi tidak valid. Silakan coba lagi.',
        'timeout-or-duplicate': 'Token verifikasi telah kedaluwarsa. Silakan verifikasi lagi.',
        'internal-error': 'Terjadi kesalahan internal pada server hCaptcha. Silakan coba lagi.'
      }
      
      const detailedError = errorMessages[errorCodes?.[0] as string] || `Verifikasi hCaptcha gagal: ${joinedErrorCodes}`
      return { success: false, error: detailedError }
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        apiLogger.error({ timeout: HCAPTCHA_CONFIG.timeout }, 'Verifikasi hCaptcha timeout')
        return { success: false, error: 'Verifikasi hCaptcha timeout. Silakan coba lagi.' }
      }
      
      apiLogger.error({ error: fetchError }, 'Error saat mengirim permintaan verifikasi hCaptcha')
      return { 
        success: false, 
        error: fetchError instanceof Error ? fetchError.message : 'Terjadi kesalahan jaringan saat verifikasi hCaptcha' 
      }
    }
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Terjadi kesalahan saat verifikasi hCaptcha')
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui saat verifikasi hCaptcha' 
    }
  }
}