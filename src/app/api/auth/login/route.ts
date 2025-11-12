export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'

const LoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = LoginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.issues },
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
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/auth/login')
  }
}

export const POST = withSecurity(loginHandler, SecurityPresets.enhanced())