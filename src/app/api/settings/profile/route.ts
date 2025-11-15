export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const profileSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wajib diisi').max(100),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

// GET /api/settings/profile - Get user profile
async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    // Get or create profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!profile) {
      // Profile doesn't exist, create it
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: user.displayName || '',
          email: user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({
        success: true,
        data: newProfile,
      })
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/settings/profile')
  }
}

// PUT /api/settings/profile - Update user profile
async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()
    const validation = profileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak valid',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Upsert profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          email: user.email!,
          ...validation.data,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Profil berhasil diperbarui',
    })
  } catch (error) {
    return handleAPIError(error, 'PUT /api/settings/profile')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())

export { securedGET as GET, securedPUT as PUT }
