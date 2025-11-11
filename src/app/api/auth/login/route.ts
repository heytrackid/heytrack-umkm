// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


 import { NextRequest, NextResponse } from 'next/server'
 import { z } from 'zod'

  import { apiLogger, logError } from '@/lib/logger'
 import { SecurityPresets, InputSanitizer, withSecurity } from '@/utils/security/index'
 import { createClient } from '@/utils/supabase/server'

// ✅ Force Node.js runtime

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  captchaToken: z.string().optional(),
})

async function loginPOST(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/auth/login - Request received')

    // DEVELOPMENT BYPASS: Only if explicitly enabled for development
    const ENABLE_DEV_BYPASS = process['env']['ENABLE_DEV_BYPASS'] === 'true'
    if (ENABLE_DEV_BYPASS && process.env.NODE_ENV === 'development') {
      apiLogger.info('POST /api/auth/login - Development mode: bypassing authentication')

      return NextResponse.json({
        user: {
          id: 'dev-user-123',
          email: 'dev@example.com',
          user_metadata: { name: 'Development User' }
        },
        session: {
          access_token: 'dev-access-token',
          refresh_token: 'dev-refresh-token',
          expires_at: Date.now() / 1000 + 3600, // 1 hour from now
        },
      })
    }

    const _body = await request.json() as { email: string; password: string }
    const validation = LoginSchema.safeParse(_body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, captchaToken } = validation.data
    const sanitizedEmail = InputSanitizer.sanitizeHtml(email).trim()

    const supabase = await createClient()

    const credentials: {
      email: string
      password: string
      captchaToken?: string
    } = {
      email: sanitizedEmail,
      password,
    }

    if (captchaToken) {
      credentials.captchaToken = captchaToken
    }

    const { data, error } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      logError(apiLogger, error, 'POST /api/auth/login - Supabase auth error')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
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