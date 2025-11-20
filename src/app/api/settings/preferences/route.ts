export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { apiLogger } from '@/lib/logger'
import type { NextResponse } from 'next/server'

const PreferencesSchema = z.object({
  system: z.object({
    defaultTax: z.number().min(0).max(100),
    lowStockThreshold: z.number().min(0),
  }),
  ui: z.object({
    theme: z.enum(['dark', 'light', 'system']),
    language: z.enum(['en', 'id']),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
    timeFormat: z.enum(['12h', '24h']),
    currency: z.string(),
    numberFormat: z.string(),
  })
})

// Define types for DB responses
interface AppSettingsRow {
  settings_data: {
    general?: Record<string, unknown>;
    user?: Record<string, unknown>;
    system?: Record<string, unknown>;
    ui?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

// GET /api/settings/preferences - Get or create preferences settings
async function getPreferencesHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  const { data: settingsData, error } = await supabase
    .from('app_settings' as never)
    .select('id, user_id, settings_data, created_at, updated_at')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
    
  const settings = settingsData as unknown as AppSettingsRow | null

  if (error) {
    apiLogger.error({ error, userId: user.id }, 'Failed to fetch preferences settings')
    return createErrorResponse('Failed to fetch settings', 500)
  }

  if (!settings) {
     // If no settings exist, we can return default values, but the client will handle merging defaults.
     // Or we can create a default record. Let's return null/empty and let client handle defaults or create one.
     // For consistency with other endpoints, let's create a default record if it's completely missing
     
     const { data: newSettingsData, error: insertError } = await supabase
      .from('app_settings' as never)
      .insert({
        user_id: user.id,
        settings_data: {
           // Default structure
           system: { defaultTax: 11, lowStockThreshold: 10 },
           ui: { theme: 'system', language: 'id', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', currency: 'IDR', numberFormat: '1.234.567,89' }
        }
      } as never)
      .select()
      .single()
      
      const newSettings = newSettingsData as unknown as AppSettingsRow

      if (insertError) {
        apiLogger.error({ error: insertError, userId: user.id }, 'Failed to create default preferences settings')
        return createErrorResponse('Failed to create settings', 500)
      }
      return createSuccessResponse(newSettings.settings_data)
  }

  return createSuccessResponse(settings.settings_data)
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/settings/preferences',
  },
  getPreferencesHandler
)

// PUT /api/settings/preferences - Update preferences
async function updatePreferencesHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof PreferencesSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return createErrorResponse('Request body is required', 400)
  }

  // First get existing data to merge
  const { data: existingData, error: fetchError } = await supabase
    .from('app_settings' as never)
    .select('settings_data')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
    
  const existing = existingData as unknown as AppSettingsRow | null
    
  if (fetchError) {
      apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch existing settings for preferences update')
      return createErrorResponse('Failed to fetch existing settings', 500)
  }
  
  const existingDataObj = existing?.settings_data || {}

  const { data: updatedData, error } = await supabase
    .from('app_settings' as never)
    .update({
      settings_data: {
        ...existingDataObj,
        system: body.system,
        ui: body.ui
      }
    } as never)
    .eq('user_id', user.id)
    .select()
    .single()
    
  const data = updatedData as unknown as AppSettingsRow

  if (error) {
    apiLogger.error({ error, userId: user.id }, 'Failed to update preferences settings')
    return createErrorResponse('Failed to update settings', 500)
  }

  return createSuccessResponse(data.settings_data, 'Preferences updated successfully')
}

export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/settings/preferences',
    bodySchema: PreferencesSchema,
  },
  updatePreferencesHandler
)
