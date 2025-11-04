// src/lib/config/hcaptcha.ts

// hCaptcha Configuration
export const HCAPTCHA_CONFIG = {
  // Development keys (ganti dengan produksi key saat deployment)
  siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '611e889c-9904-477e-aaa0-ff685616f536',
  // Secret key hanya digunakan di server
  secretKey: process.env.HCAPTCHA_SECRET_KEY || null,
  // Timeout untuk verifikasi (dalam milidetik)
  timeout: 10000,
  // Endpoint verifikasi
  verifyEndpoint: 'https://api.hcaptcha.com/siteverify',
} as const

// Validasi konfigurasi
export const validateHcaptchaConfig = (): { isValid: boolean; error?: string } => {
  if (!HCAPTCHA_CONFIG.siteKey) {
    return { isValid: false, error: 'NEXT_PUBLIC_HCAPTCHA_SITE_KEY tidak diatur' }
  }
  
  if (!HCAPTCHA_CONFIG.secretKey) {
    if (process.env.NODE_ENV === 'production') {
      return { isValid: false, error: 'HCAPTCHA_SECRET_KEY tidak diatur untuk lingkungan produksi' }
    }
    // Untuk development, kita bisa lanjutkan tanpa secret key tapi dengan peringatan
    console.warn('HCAPTCHA_SECRET_KEY tidak diatur. hCaptcha akan diabaikan di lingkungan development.')
  }
  
  return { isValid: true }
}