export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { PositiveNumberSchema } from '@/lib/validations/common'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { z } from 'zod'

const UpdateOnboardingSchema = z.object({
  current_step: PositiveNumberSchema.optional(),
  steps_completed: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  skipped: z.boolean().optional(),
})

// GET /api/onboarding - Get onboarding status
async function getOnboardingHandler(context: RouteContext) {
  const { user, supabase } = context

  try {

    // Get or create onboarding record
    const { data: onboarding, error } = await supabase
      .from('user_onboarding')
      .select('id, user_id, current_step, steps_completed, completed, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    // If no record exists, create one
    if (!onboarding) {
      const { data: newOnboarding, error: insertError } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: user.id,
          current_step: 0,
          steps_completed: [],
          completed: false,
        })
        .select('id, user_id, current_step, steps_completed, completed, created_at, updated_at')
        .single()

      if (insertError) throw insertError

      return createSuccessResponse({
        data: newOnboarding,
        message: 'Onboarding record created'
      })
    }

    return createSuccessResponse({
      data: onboarding,
      message: 'Onboarding status retrieved'
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/onboarding')
  }
}

// PATCH /api/onboarding - Update onboarding progress
async function updateOnboardingHandler(context: RouteContext, _query?: never, body?: z.infer<typeof UpdateOnboardingSchema>) {
  const { user, supabase } = context

  if (!body) {
    return handleAPIError(new Error('Request body is required'), 'API Route')
  }

  try {

    const updateData: Record<string, unknown> = {}
    if (typeof body.current_step === 'number') updateData['current_step'] = body.current_step
    if (Array.isArray(body.steps_completed)) updateData['steps_completed'] = body.steps_completed
    if (typeof body.completed === 'boolean') {
      updateData['completed'] = body.completed
      if (body.completed) updateData['completed_at'] = new Date().toISOString()
    }
    if (typeof body.skipped === 'boolean') updateData['skipped'] = body.skipped

    const { data, error } = await supabase
      .from('user_onboarding')
      .upsert(
        {
          user_id: user.id,
          ...updateData,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select('id, user_id, current_step, steps_completed, completed, created_at, updated_at')
      .single()

    if (error) throw error

    return createSuccessResponse({
      data,
      message: 'Onboarding progress updated'
    })
  } catch (error) {
    return handleAPIError(error, 'PATCH /api/onboarding')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/onboarding',
    securityPreset: SecurityPresets.basic(),
  },
  getOnboardingHandler
)

export const PATCH = createApiRoute(
  {
    method: 'PATCH',
    path: '/api/onboarding',
    bodySchema: UpdateOnboardingSchema,
    securityPreset: SecurityPresets.basic(),
  },
  updateOnboardingHandler
)
