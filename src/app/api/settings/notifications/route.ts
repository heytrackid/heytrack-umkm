export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const notificationSchema = z.object({
  low_stock_alerts: z.boolean().optional(),
  new_order_alerts: z.boolean().optional(),
  payment_alerts: z.boolean().optional(),
  daily_summary: z.boolean().optional(),
  weekly_report: z.boolean().optional(),
})

// GET /api/settings/notifications - Get notification settings
async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    // Get or create notification settings
    let { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('settings_data->>type', 'notifications')
      .single()

    if (error && error.code === 'PGRST116') {
      // Settings don't exist, create default
      const { data: newSettings, error: insertError } = await supabase
        .from('app_settings')
        .insert({
          user_id: user.id,
          settings_data: {
            type: 'notifications',
            low_stock_alerts: true,
            new_order_alerts: true,
            payment_alerts: true,
            daily_summary: false,
            weekly_report: false,
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
    return handleAPIError(error, 'GET /api/settings/notifications')
  }
}

// PUT /api/settings/notifications - Update notification settings
async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()
    const validation = notificationSchema.safeParse(body)

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

    // Upsert notification settings
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          user_id: user.id,
          settings_data: {
            type: 'notifications',
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
      message: 'Preferensi notifikasi berhasil diperbarui',
    })
  } catch (error) {
    return handleAPIError(error, 'PUT /api/settings/notifications')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())

export { securedGET as GET, securedPUT as PUT }
