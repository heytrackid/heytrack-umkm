export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import type { NextResponse } from 'next/server'

const BusinessSchema = z.object({
  business_name: z.string().min(1).max(100),
  business_type: z.string().optional(),
  address: z.string().optional(),
  business_phone: z.string().optional(),
  tax_id: z.string().optional(),
})

// GET /api/settings/business - Get or create business settings
async function getBusinessHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  const { data: settings, error } = await supabase
    .from('app_settings' as never)
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return createErrorResponse('Failed to fetch settings', 500)
  }

  if (!settings) {
    // Create default settings
    const { data: newSettings, error: insertError } = await supabase
      .from('app_settings' as never)
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
      } as never)
      .select()
      .single()

    if (insertError) {
      return createErrorResponse('Failed to create settings', 500)
    }

    return createSuccessResponse(newSettings)
  }

  return createSuccessResponse(settings)
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/settings/business',
  },
  getBusinessHandler
)

// PUT /api/settings/business - Update business settings
async function updateBusinessHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof BusinessSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return createErrorResponse('Request body is required', 400)
  }

  const { data, error } = await supabase
    .from('app_settings' as never)
    .update({
      settings_data: {
        type: 'business',
        ...body
      }
    } as never)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return createErrorResponse('Failed to update settings', 500)
  }

  return createSuccessResponse(data, 'Business settings updated successfully')
}

export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/settings/business',
    bodySchema: BusinessSchema,
  },
  updateBusinessHandler
)
