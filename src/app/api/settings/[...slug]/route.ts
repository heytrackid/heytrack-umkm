// External libraries
// Internal modules
import { NextResponse } from 'next/server'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { z } from 'zod'

// Types and schemas
// Constants and config
export const runtime = 'nodejs'

const BusinessSchema = z.object({
  businessName: z.string().optional().or(z.literal('')),
  businessType: z.string().optional(),
  address: z.string().optional(),
  business_phone: z.string().optional().or(z.literal('')),
  phone: z.string().optional(),
  tax_id: z.string().optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
})

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

const ProfileSchema = z.object({
  fullName: z.string().min(1).max(100),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().optional(),
})

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

interface UserProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar?: string | null;
  [key: string]: unknown;
}

const mapDbRoleToDisplay = (role?: string | null): string | undefined => {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return 'Admin'
    case 'manager':
      return 'Manager'
    case 'staff':
      return 'Staff'
    case 'viewer':
      return 'Viewer'
    default:
      return undefined
  }
}

// GET /api/settings/[...slug] - Dynamic settings routes
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/settings',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'business':
        return getBusinessHandler(context)
      case 'preferences':
        return getPreferencesHandler(context)
      case 'profile':
        return getProfileHandler(context)
      default:
        return handleAPIError(new Error('Invalid settings route'), 'API Route')
    }
  }
)

// PUT /api/settings/[...slug] - Dynamic settings routes
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/settings',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { params, request } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'business':
        return updateBusinessHandler(context, request)
      case 'preferences':
        return updatePreferencesHandler(context, request)
      case 'profile':
        return updateProfileHandler(context, request)
      default:
        return handleAPIError(new Error('Invalid settings route'), 'API Route')
    }
  }
)

// Business handlers
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
    return handleAPIError(new Error('Failed to fetch settings'), 'API Route')
  }

  if (!settings) {
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
      return handleAPIError(new Error('Failed to create settings'), 'API Route')
    }

    const data = newSettings.settings_data?.general || newSettings.settings_data
    return createSuccessResponse(data)
  }

  const data = settings.settings_data?.general || settings.settings_data
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

async function updateBusinessHandler(context: RouteContext, request: Request): Promise<NextResponse> {
  const { user, supabase } = context
  const body = await request.json() as z.infer<typeof BusinessSchema>

  const { data: existingData, error: fetchError } = await supabase
    .from('app_settings' as never)
    .select('settings_data')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const existing = existingData as { settings_data: Record<string, unknown> } | null

  if (fetchError) {
    apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch existing settings for update')
    return handleAPIError(new Error('Failed to fetch existing settings'), 'API Route')
  }

  const existingDataObj = existing?.settings_data || {}

  const newGeneral = { ...body }

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
    return handleAPIError(new Error('Failed to update settings'), 'API Route')
  }

  return createSuccessResponse(data.settings_data?.general, 'Business settings updated successfully')
}

// Preferences handlers
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
    return handleAPIError(new Error('Failed to fetch settings'), 'API Route')
  }

  if (!settings) {
    const { data: newSettingsData, error: insertError } = await supabase
      .from('app_settings' as never)
      .insert({
        user_id: user.id,
        settings_data: {
          system: { defaultTax: 11, lowStockThreshold: 10 },
          ui: { theme: 'system', language: 'id', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', currency: 'IDR', numberFormat: '1.234.567,89' }
        }
      } as never)
      .select()
      .single()

    const newSettings = newSettingsData as unknown as AppSettingsRow

    if (insertError) {
      apiLogger.error({ error: insertError, userId: user.id }, 'Failed to create default preferences settings')
      return handleAPIError(new Error('Failed to create settings'), 'API Route')
    }
    return createSuccessResponse(newSettings.settings_data)
  }

  return createSuccessResponse(settings.settings_data)
}

async function updatePreferencesHandler(context: RouteContext, request: Request): Promise<NextResponse> {
  const { user, supabase } = context
  const body = await request.json() as z.infer<typeof PreferencesSchema>

  const { data: existingData, error: fetchError } = await supabase
    .from('app_settings' as never)
    .select('settings_data')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const existing = existingData as unknown as AppSettingsRow | null

  if (fetchError) {
    apiLogger.error({ error: fetchError, userId: user.id }, 'Failed to fetch existing settings for preferences update')
    return handleAPIError(new Error('Failed to fetch existing settings'), 'API Route')
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
    return handleAPIError(new Error('Failed to update settings'), 'API Route')
  }

  return createSuccessResponse(data.settings_data, 'Preferences updated successfully')
}

// Profile handlers
async function getProfileHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    const [profileResult, settingsResult] = await Promise.all([
      supabase
        .from('user_profiles' as never)
        .select('id, user_id, full_name, email, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('app_settings' as never)
        .select('settings_data')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
    ])

    const profile = profileResult.data as UserProfileRow | null
    const settingsData = (settingsResult.data as AppSettingsRow | null)?.settings_data || {}
    const userSettings = settingsData.user || {}

    if (profileResult.error) {
      apiLogger.error({ error: profileResult.error, userId: user.id }, 'Failed to fetch user profile')
      return handleAPIError(new Error('Failed to fetch profile'), 'API Route')
    }

    if (!profile) {
      const { data: newProfileData, error: insertError } = await supabase
        .from('user_profiles' as never)
        .insert({
          user_id: user.id,
          full_name: '',
          email: user.email,
          role: 'admin',
        } as never)
        .select()
        .single()

      const newProfile = newProfileData as unknown as UserProfileRow

      if (insertError) {
        apiLogger.error({ error: insertError, userId: user.id }, 'Failed to create default user profile')
        return handleAPIError(new Error('Failed to create profile'), 'API Route')
      }

      const userSettingsTyped = userSettings as {
        fullName?: string;
        email?: string;
        role?: string;
        avatar?: string | null;
        phone?: string;
        bio?: string;
      }

      const mappedProfile = {
        ...userSettings,
        fullName: userSettingsTyped.fullName || newProfile.full_name || '',
        email: userSettingsTyped.email || newProfile.email || user.email || '',
        role: userSettingsTyped.role || 'Owner',
        avatar: userSettingsTyped.avatar ?? null,
        phone: userSettingsTyped.phone || '',
        bio: userSettingsTyped.bio || ''
      }
      return createSuccessResponse(mappedProfile)
    }

    const userSettingsTyped = userSettings as {
      fullName?: string;
      email?: string;
      role?: string;
      avatar?: string | null;
      phone?: string;
      bio?: string;
    }

    const mappedProfile = {
      ...userSettings,
      fullName: userSettingsTyped.fullName || profile.full_name || '',
      email: userSettingsTyped.email || profile.email || user.email || '',
      role: userSettingsTyped.role || mapDbRoleToDisplay(profile.role) || 'Owner',
      avatar: userSettingsTyped.avatar ?? null,
      phone: userSettingsTyped.phone || '',
      bio: userSettingsTyped.bio || ''
    }

    return createSuccessResponse(mappedProfile)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Unexpected error in getProfileHandler')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

async function updateProfileHandler(context: RouteContext, request: Request): Promise<NextResponse> {
  const { user, supabase } = context
  const body = await request.json() as z.infer<typeof ProfileSchema>

  const dbUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  const bodyTyped = body as { fullName?: string; full_name?: string }
  if (bodyTyped.fullName !== undefined) dbUpdate['full_name'] = bodyTyped.fullName
  else if (bodyTyped.full_name !== undefined) dbUpdate['full_name'] = bodyTyped.full_name

  const { data: existingSettingsData } = await supabase
    .from('app_settings' as never)
    .select('settings_data')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const existingSettings = existingSettingsData as AppSettingsRow | null
  const currentSettingsData = existingSettings?.settings_data || {}
  const currentUserSettings = currentSettingsData.user || {}

  const newUserSettings = {
    ...currentUserSettings,
    ...body,
    fullName: (body as { fullName?: string; full_name?: string }).fullName || (body as { fullName?: string; full_name?: string }).full_name || (currentUserSettings as { fullName?: string }).fullName,
  }

  const { error: settingsError } = await supabase
    .from('app_settings' as never)
    .update({
      settings_data: {
        ...currentSettingsData,
        user: newUserSettings
      }
    } as never)
    .eq('user_id', user.id)

  if (settingsError) {
    apiLogger.error({ error: settingsError, userId: user.id }, 'Failed to update profile settings in app_settings')
    return handleAPIError(new Error('Failed to update settings storage'), 'API Route')
  }

  if (body.fullName || body.full_name) {
    const newName = body.fullName || body.full_name
    await supabase
      .from('user_profiles' as never)
      .update({ full_name: newName } as never)
      .eq('user_id', user.id)
  }

  return createSuccessResponse(newUserSettings, 'Profile updated successfully')
}