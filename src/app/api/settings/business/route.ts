export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import type { NextResponse } from 'next/server'

const BusinessSchema = z.object({
  businessName: z.string().optional().or(z.literal('')), // Optional for updates; frontend enforces requirement
  businessType: z.string().optional(),
  address: z.string().optional(),
  business_phone: z.string().optional().or(z.literal('')), // Legacy key fallback
  phone: z.string().optional(),
  tax_id: z.string().optional().or(z.literal('')), // Legacy key fallback
  taxNumber: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
})

// Define types for DB responses since supabase types are not fully inferred with 'as never'
interface AppSettingsRow {
  id: string;
  user_id: string;
  settings_data: {
    general?: Record<string, unknown>;
    user?: Record<string, unknown>;
    system?: Record<string, unknown>;
    ui?: Record<string, unknown>;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

// GET /api/settings/business - Get or create business settings
async function getBusinessHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  const { data: settingsData, error } = await supabase
    .from('app_settings' as never)
    .select('id, user_id, settings_data, created_at, updated_at')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  
  const settings = settingsData as AppSettingsRow | null

  if (error) {
    apiLogger.error({ error, userId: user.id }, 'Failed to fetch business settings')
    return createErrorResponse('Failed to fetch settings', 500)
  }

  if (!settings) {
    // Create default settings
    const { data: newSettingsData, error: insertError } = await supabase
      .from('app_settings' as never)
      .insert({
        user_id: user.id,
        settings_data: {
          general: {
            businessName: '',
            businessType: 'UMKM',
            address: '',
            phone: '',
            email: '',
            website: '',
            description: '',
            taxNumber: '',
            currency: 'IDR',
            timezone: 'Asia/Jakarta'
          }
        }
      } as never)
      .select()
      .single()
      
    const newSettings = newSettingsData as unknown as AppSettingsRow

    if (insertError) {
      apiLogger.error({ error: insertError, userId: user.id }, 'Failed to create default business settings')
      return createErrorResponse('Failed to create settings', 500)
    }

    // Return just the general part if it exists, or the whole blob if structure is different?
    // For consistency with frontend expectation which might expect flat object or nested?
    // The frontend currently expects 'GeneralSettings' object.
    // Let's return the 'general' key from settings_data if it exists, or map from legacy structure if needed.
    const data = newSettings.settings_data?.general || newSettings.settings_data
    return createSuccessResponse(data)
  }

  // Handle legacy structure where data might be flat or under 'general'
  const data = settings.settings_data?.general || settings.settings_data

  // Map legacy keys if necessary (temporary migration helper)
  const dataTyped = data as Record<string, unknown>
  if (dataTyped && !dataTyped['businessName'] && dataTyped['business_name']) {
     dataTyped['businessName'] = dataTyped['business_name']
  }
  if (dataTyped && !dataTyped['phone'] && dataTyped['business_phone']) {
     dataTyped['phone'] = dataTyped['business_phone']
  }
  if (dataTyped && !dataTyped['taxNumber'] && dataTyped['tax_id']) {
     dataTyped['taxNumber'] = dataTyped['tax_id']
  }

  return createSuccessResponse(data)
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

  // First fetch existing to merge
  const { data: existingData, error: fetchError } = await supabase
    .from('app_settings' as never)
    .select('settings_data')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
    
  const existing = existingData as { settings_data: Record<string, unknown> } | null
    
  if (fetchError) {
      apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch existing settings for update')
      return createErrorResponse('Failed to fetch existing settings', 500)
  }

  const existingDataObj = existing?.settings_data || {}
  
  // Prepare new general settings
  const newGeneral = {
      ...body,
      // Ensure we map back to schema if we received mixed keys, but we should try to standardize on camelCase 'phone', 'taxNumber'
  }

  const { data: updatedData, error } = await supabase
    .from('app_settings' as never)
    .update({
      settings_data: {
        ...existingDataObj,
        general: newGeneral
      }
    } as never)
    .eq('user_id', user.id)
    .select()
    .single()
    
  const data = updatedData as unknown as AppSettingsRow

  if (error) {
    apiLogger.error({ error, userId: user.id }, 'Failed to update business settings')
    return createErrorResponse('Failed to update settings', 500)
  }

  return createSuccessResponse(data.settings_data?.general, 'Business settings updated successfully')
}

export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/settings/business',
    bodySchema: BusinessSchema,
  },
  updateBusinessHandler
)
