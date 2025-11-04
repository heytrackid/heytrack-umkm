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
    // Validasi konfigurasi
    const configValidation = HCAPTCHA_CONFIG.secretKey 
      ? { isValid: true } 
      : { isValid: false, error: 'HCAPTCHA_SECRET_KEY tidak diatur untuk lingkungan produksi' }
    
    if (!configValidation.isValid) {
      if (process.env.NODE_ENV === 'production') {
        apiLogger.error({ configValidation }, 'Konfigurasi hCaptcha tidak valid untuk lingkungan produksi')
        return { success: false, error: configValidation.error }
      } else {
        // Di development, jika tidak ada secret key, skip verifikasi hCaptcha
        apiLogger.warn('HCAPTCHA_SECRET_KEY tidak diatur. Verifikasi hCaptcha dilewati dalam lingkungan development.')
        return { success: true }
      }
    }

    const formData = new FormData()
    formData.append('secret', HCAPTCHA_CONFIG.secretKey!)
    formData.append('response', token)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HCAPTCHA_CONFIG.timeout)

    try {
      const response = await fetch(HCAPTCHA_CONFIG.verifyEndpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const statusText = response.statusText
        apiLogger.error({ status: response.status, statusText }, 'Respons tidak berhasil dari endpoint verifikasi hCaptcha')
        return { success: false, error: `Respons tidak berhasil dari server hCaptcha: ${statusText}` }
      }

      const result: HCaptchaVerificationResponse = await response.json()

      if (result.success) {
        apiLogger.info('Verifikasi hCaptcha berhasil')
        return { success: true }
      } else {
        const errorCodes = result['error-codes']?.join(', ') || 'error tidak diketahui'
        apiLogger.error({ errorCodes }, 'Verifikasi hCaptcha gagal')
        return { success: false, error: `Verifikasi hCaptcha gagal: ${errorCodes}` }
      }
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        apiLogger.error('Verifikasi hCaptcha timeout')
        return { success: false, error: 'Verifikasi hCaptcha timeout' }
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