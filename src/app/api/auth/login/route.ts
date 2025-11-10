// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


 import { type NextRequest, NextResponse } from 'next/server'
 import { z } from 'zod'

 import { apiLogger, logError } from '@/lib/logger'
 import { withSecurity, SecurityPresets } from '@/utils/security/index'
 import { createClient } from '@/utils/supabase/server'

// ✅ Force Node.js runtime

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

    const { email, password } = validation.data

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

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

const devAuthSecurity = {
  ...SecurityPresets.enhanced(),
  enableCSRFProtection: true,
  allowedOrigins: [
    process['env']['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'https://ndelok.heytrack.id',
    'https://heytrack.id'
  ]
}

export const POST = withSecurity(loginPOST, devAuthSecurity)