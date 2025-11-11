// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


 import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

  import { apiLogger, logError } from '@/lib/logger'
import { InputSanitizer, SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

// ✅ Force Node.js runtime

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  captcha_token: z.string().optional(),
})

async function loginPOST(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/auth/login - Request received')

    const _body = await request.json() as { email: string; password: string }
    const validation = LoginSchema.safeParse(_body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, captcha_token: captchaToken } = validation.data
    const sanitizedEmail = InputSanitizer.sanitizeHtml(email).trim()

    const supabase = await createClient()

    const credentials: {
      email: string
      password: string
      captcha_token?: string
    } = {
      email: sanitizedEmail,
      password,
    }

    // Include captcha_token if provided
    if (captchaToken) {
      credentials.captcha_token = captchaToken
    }

    // Validate Turnstile token before Supabase auth
    if (captchaToken) {
      try {
        const secretKey = process.env['TURNSTILE_SECRET_KEY']
        if (!secretKey) {
          apiLogger.error('Turnstile secret key not configured')
          return NextResponse.json({
            error: 'Konfigurasi keamanan bermasalah. Silakan hubungi admin.'
          }, { status: 500 })
        }

        // Get client IP for better validation
        const clientIP = request.headers.get('cf-connecting-ip') ||
                         request.headers.get('x-forwarded-for') ||
                         request.headers.get('x-real-ip') ||
                         'unknown'

        // Validate token with Cloudflare directly
        const formData = new FormData()
        formData.append('secret', secretKey)
        formData.append('response', captchaToken)
        if (clientIP !== 'unknown') {
          formData.append('remoteip', clientIP)
        }

        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData,
        })

        if (!verifyResponse.ok) {
          apiLogger.warn({ turnstileStatus: verifyResponse.status }, 'Turnstile API error')
          return NextResponse.json({
            error: 'Layanan verifikasi keamanan bermasalah. Silakan coba lagi.'
          }, { status: 502 })
        }

        const verifyData = await verifyResponse.json()

        if (!verifyData.success) {
          const errorCodes = verifyData['error-codes'] || []
          apiLogger.warn({
            errorCodes,
            turnstileHostname: verifyData.hostname
          }, 'Turnstile token validation failed')

          let errorMessage = 'Verifikasi keamanan gagal. Silakan refresh halaman dan coba lagi.'
          if (errorCodes.includes('timeout-or-duplicate')) {
            errorMessage = 'Token keamanan sudah expired. Silakan refresh halaman.'
          }

          return NextResponse.json({
            error: errorMessage,
            debug: { turnstileErrorCodes: errorCodes }
          }, { status: 400 })
        }

        apiLogger.info({ turnstileValidated: true }, 'Turnstile token validated successfully')
      } catch (turnstileError) {
        apiLogger.error({ turnstileError }, 'Error validating Turnstile token')
        return NextResponse.json({
          error: 'Terjadi kesalahan verifikasi keamanan. Silakan coba lagi.',
          debug: { turnstileError: turnstileError instanceof Error ? turnstileError.message : 'Unknown error' }
        }, { status: 500 })
      }
    }

    apiLogger.info({
      email: sanitizedEmail,
      hasCaptchaToken: !!captchaToken,
      captchaTokenPrefix: captchaToken?.substring(0, 20)
    }, 'Attempting Supabase login')

    const { data, error } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      apiLogger.error({ 
        error,
        errorMessage: error.message,
        errorStatus: error.status,
        errorCode: error.code,
        errorName: error.name,
        email: sanitizedEmail,
        hasCaptchaToken: !!captchaToken
      }, 'POST /api/auth/login - Supabase auth error')
      
      // More specific error messages
      let errorMessage = 'Invalid credentials'
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email belum dikonfirmasi. Silakan cek inbox email kamu.'
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah.'
      } else if (error.message.includes('Email rate limit exceeded')) {
        errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
      } else if (error.code === 'unexpected_failure') {
        errorMessage = 'Terjadi kesalahan autentikasi. Silakan coba lagi atau hubungi admin.'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        // Include error details for debugging (production too, for now)
        debug: { 
          message: error.message,
          code: error.code,
          status: error.status
        }
      }, { status: 401 })
    }

    apiLogger.info({ userId: data.user?.id }, 'POST /api/auth/login - Success')

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })

    } catch (error: unknown) {
      logError(apiLogger, error, 'POST /api/auth/login - Unexpected error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export const POST = withSecurity(loginPOST, SecurityPresets.enhanced())