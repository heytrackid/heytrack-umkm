export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'
import type { NextResponse } from 'next/server'
import { z } from 'zod'

const ProfileSchema = z.object({
  fullName: z.string().min(1).max(100),
  full_name: z.string().optional(), // Legacy fallback
  email: z.string().email().optional(), // Read-only usually, but good to have
  phone: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().optional(),
})

// Define types for DB responses
interface UserProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  avatar?: string | null; // Might be missing in DB but we use mapped object
  [key: string]: unknown;
}

interface AppSettingsRow {
  settings_data: {
    user?: {
      fullName?: string;
      email?: string;
      phone?: string;
      role?: string;
      avatar?: string | null;
      bio?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
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

// GET /api/settings/profile - Get or create user profile
async function getProfileHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    // Get data from BOTH sources
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
      return createErrorResponse('Failed to fetch profile', 500)
    }

  if (!profile) {
    // Create default profile
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
      return createErrorResponse('Failed to create profile', 500)
    }
    
    // Map to UserSettings shape, merging with any app_settings found (unlikely if profile is new, but possible)
    const mappedProfile = {
        ...userSettings,
        fullName: userSettings.fullName || newProfile.full_name || '',
        email: userSettings.email || newProfile.email || user.email || '',
        role: userSettings.role || 'Owner',
        avatar: userSettings.avatar ?? null,
        phone: userSettings.phone || '',
        bio: userSettings.bio || ''
    }
    return createSuccessResponse(mappedProfile)
  }
  
  // Map to UserSettings shape merging both sources
  const mappedProfile = {
      ...userSettings,
      fullName: userSettings.fullName || profile.full_name || '',
      email: userSettings.email || profile.email || user.email || '',
      role: userSettings.role || mapDbRoleToDisplay(profile.role) || 'Owner',
      avatar: userSettings.avatar ?? null,
      phone: userSettings.phone || '',
      bio: userSettings.bio || ''
  }

  return createSuccessResponse(mappedProfile)
  } catch (error) {
    apiLogger.error({ error, userId: user.id }, 'Unexpected error in getProfileHandler')
    return createErrorResponse('Internal server error', 500)
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/settings/profile',
    securityPreset: SecurityPresets.basic(), // Use basic preset to avoid aggressive rate limiting
  },
  getProfileHandler
)

// PUT /api/settings/profile - Update user profile
async function updateProfileHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof ProfileSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return createErrorResponse('Request body is required', 400)
  }
  
  // Map incoming UserSettings keys to DB keys
  const dbUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString()
  }

  if (body.fullName !== undefined) dbUpdate['full_name'] = body.fullName
  else if (body['full_name'] !== undefined) dbUpdate['full_name'] = body['full_name']
  
  // We no longer try to update phone/bio directly on user_profiles table
  
  const { data: existingSettingsData, error: fetchError } = await supabase
    .from('app_settings' as never)
    .select('settings_data')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  
  const existingSettings = existingSettingsData as AppSettingsRow | null
  const currentSettingsData = existingSettings?.settings_data || {}
  const currentUserSettings = currentSettingsData.user || {}
  
  // Merge body into user settings
  const newUserSettings = {
      ...currentUserSettings,
      ...body,
      // Ensure camelCase
      fullName: body.fullName || body.full_name || currentUserSettings.fullName,
  }
  
  // 1. Update app_settings
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
      return createErrorResponse('Failed to update settings storage', 500)
  }

  // 2. Sync to user_profiles if name changed
  if (body.fullName || body.full_name) {
      const newName = body.fullName || body.full_name
      await supabase
          .from('user_profiles' as never)
          .update({ full_name: newName } as never)
          .eq('user_id', user.id)
  }

  return createSuccessResponse(newUserSettings, 'Profile updated successfully')
}

export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/settings/profile',
    bodySchema: ProfileSchema,
    securityPreset: SecurityPresets.basic(), // Use basic preset to avoid aggressive rate limiting
  },
  updateProfileHandler
)
