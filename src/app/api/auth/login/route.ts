 import { createClient } from '@/utils/supabase/server'
 import { type NextRequest, NextResponse } from 'next/server'
 import { apiLogger, logError } from '@/lib/logger'
 import { z } from 'zod'
 import { withSecurity, SecurityPresets } from '@/utils/security'

// ✅ Force Node.js runtime
export const runtime = 'nodejs'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

async function loginPOST(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/auth/login - Request received')

    const body = await request.json()
    const validation = LoginSchema.safeParse(body)

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

export const POST = withSecurity(loginPOST, SecurityPresets.enhanced())