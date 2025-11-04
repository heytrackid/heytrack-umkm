'use server'

import { apiLogger } from '@/lib/logger'

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
    // Dalam implementasi sebenarnya, Anda akan mengirim token ke API verifikasi hCaptcha
    // Untuk saat ini, kita implementasikan verifikasi mock untuk keperluan development
    // Di production, Anda harus menggunakan: https://docs.hcaptcha.com/#verify-the-user-response-server-side
    
    const secret = process.env.HCAPTCHA_SECRET_KEY
    if (!secret) {
      apiLogger.warn('Variabel lingkungan HCAPTCHA_SECRET_KEY tidak diatur')
      // Di development, kita bisa melewati pemeriksaan, tetapi di production harus diperlukan
      if (process.env.NODE_ENV === 'production') {
        return { success: false, error: 'Konfigurasi hCaptcha bermasalah' }
      } else {
        // Untuk development, terima semua token
        return { success: true }
      }
    }

    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)

    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      body: formData
    })

    const result: HCaptchaVerificationResponse = await response.json()

    if (result.success) {
      apiLogger.info('Verifikasi hCaptcha berhasil')
      return { success: true }
    } else {
      const errorCodes = result['error-codes']?.join(', ') || 'error tidak diketahui'
      apiLogger.error({ errorCodes }, 'Verifikasi hCaptcha gagal')
      return { success: false, error: `Verifikasi hCaptcha gagal: ${errorCodes}` }
    }
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Terjadi kesalahan saat verifikasi hCaptcha')
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui saat verifikasi hCaptcha' 
    }
  }
}