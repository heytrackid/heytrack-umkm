export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import type { NextResponse } from 'next/server'

const ProfileSchema = z.object({
  full_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

// GET /api/settings/profile - Get or create user profile
async function getProfileHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase } = context

  const { data: profile, error } = await supabase
    .from('user_profiles' as never)
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return createErrorResponse('Failed to fetch profile', 500)
  }

  if (!profile) {
    // Create default profile
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles' as never)
      .insert({
        user_id: user.id,
        full_name: '',
        email: user.email,
      } as never)
      .select()
      .single()

    if (insertError) {
      return createErrorResponse('Failed to create profile', 500)
    }

    return createSuccessResponse(newProfile)
  }

  return createSuccessResponse(profile)
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/settings/profile',
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

  const { data, error } = await supabase
    .from('user_profiles' as never)
    .update(body as never)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return createErrorResponse('Failed to update profile', 500)
  }

  return createSuccessResponse(data, 'Profile updated successfully')
}

export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/settings/profile',
    bodySchema: ProfileSchema,
  },
  updateProfileHandler
)
