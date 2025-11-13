export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

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
      // Provide more specific error messages
      let errorMessage = 'Email atau password salah'
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email belum dikonfirmasi. Silakan cek inbox Anda.'
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah'
      } else if (error.message.includes('User not found')) {
        errorMessage = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    // Verify session was created
    if (!data.session) {
      return NextResponse.json(
        { error: 'Gagal membuat sesi. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/auth/login')
  }
}

export const POST = withSecurity(loginHandler, SecurityPresets.enhanced())