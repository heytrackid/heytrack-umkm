export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const businessSchema = z.object({
  business_name: z.string().min(1, 'Nama bisnis wajib diisi').max(100),
  business_type: z.string().optional(),
  address: z.string().optional(),
  business_phone: z.string().optional(),
  tax_id: z.string().optional(),
})

// GET /api/settings/business - Get business settings
async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    // Get or create business settings using app_settings
    let { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('settings_data->>type', 'business')
      .single()

    if (error && error.code === 'PGRST116') {
      // Settings don't exist, create default
      const { data: newSettings, error: insertError } = await supabase
        .from('app_settings')
        .insert({
          user_id: user.id,
          settings_data: {
            type: 'business',
            business_name: '',
            business_type: '',
            address: '',
            business_phone: '',
            tax_id: ''
          }
        })
        .select()
        .single()

      if (insertError) throw insertError
      settings = newSettings
    } else if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/settings/business')
  }
}

// PUT /api/settings/business - Update business settings
async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()
    const validation = businessSchema.safeParse(body)

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

    // Upsert business settings
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          user_id: user.id,
          settings_data: {
            type: 'business',
            ...validation.data,
          }
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Pengaturan bisnis berhasil diperbarui',
    })
  } catch (error) {
    return handleAPIError(error, 'PUT /api/settings/business')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())

export { securedGET as GET, securedPUT as PUT }
