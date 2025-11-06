import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger, logError } from '@/lib/logger'
import { z } from 'zod'

// ✅ Force Node.js runtime
export const runtime = 'nodejs'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
})

export async function POST(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/auth/signup - Request received')

    const body = await request.json()
    const validation = SignupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, fullName } = validation.data

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      logError(apiLogger, error, 'POST /api/auth/signup - Supabase auth error')
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    apiLogger.info({ userId: data.user?.id }, 'POST /api/auth/signup - Success')

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })

  } catch (error: unknown) {
    logError(apiLogger, error, 'POST /api/auth/signup - Unexpected error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}