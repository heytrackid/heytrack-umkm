export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

const RegisterSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = RegisterSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.issues },
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
      // Provide more specific error messages
      let errorMessage = error.message
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Email sudah terdaftar. Silakan login atau gunakan email lain.'
      } else if (error.message.includes('Password should be')) {
        errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Format email tidak valid.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Check if user was created
    if (!data.user) {
      return NextResponse.json(
        { error: 'Gagal membuat akun. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      needsEmailConfirmation: !data.session,
      message: data.session 
        ? 'Akun berhasil dibuat. Anda akan diarahkan ke dashboard.'
        : 'Akun berhasil dibuat. Silakan cek email Anda untuk konfirmasi.'
    })
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
