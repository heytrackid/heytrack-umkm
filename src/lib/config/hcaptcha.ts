// src/lib/config/hcaptcha.ts

import { logger } from '@/lib/logger'

// hCaptcha Configuration
export const HCAPTCHA_CONFIG = {
  // Use environment variables or default to empty string
  siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '',
  // Secret key hanya digunakan di server
  secretKey: process.env.HCAPTCHA_SECRET_KEY ?? null,
  // Timeout untuk verifikasi (dalam milidetik)
  timeout: 15000, // Increased timeout to handle slower networks
  // Endpoint verifikasi
  verifyEndpoint: 'https://api.hcaptcha.com/siteverify',
} as const

// Validasi konfigurasi
export const validateHcaptchaConfig = (): { isValid: boolean; error?: string } => {
  if (!HCAPTCHA_CONFIG.siteKey) {
    if (process.env.NODE_ENV === 'production') {
      return { isValid: false, error: 'NEXT_PUBLIC_HCAPTCHA_SITE_KEY tidak diatur untuk lingkungan produksi' }
    }
    // For development, allow empty keys but warn
    logger.warn('NEXT_PUBLIC_HCAPTCHA_SITE_KEY tidak diatur. hCaptcha akan dinonaktifkan di lingkungan development.')
  }
  
  if (!HCAPTCHA_CONFIG.secretKey) {
    if (process.env.NODE_ENV === 'production') {
      return { isValid: false, error: 'HCAPTCHA_SECRET_KEY tidak diatur untuk lingkungan produksi' }
    }
    // For development, warn about missing secret key
    logger.warn('HCAPTCHA_SECRET_KEY tidak diatur. hCaptcha verifikasi akan dilewati di lingkungan development.')
  }
  
  return { isValid: true }
}

// Function to check if hCaptcha is configured for production
export const isHcaptchaEnabled = (): boolean => {
  // Only enable hCaptcha in production if both keys are set
  if (process.env.NODE_ENV === 'production') {
    return !!HCAPTCHA_CONFIG.siteKey && !!HCAPTCHA_CONFIG.secretKey
  }
  
  // In development, only enable if both keys are set (allowing local testing)
  return !!HCAPTCHA_CONFIG.siteKey && !!HCAPTCHA_CONFIG.secretKey
}