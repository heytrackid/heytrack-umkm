export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core/responses'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/onboarding - Get onboarding status
async function getHandler(_request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

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
async function patchHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()
    const { current_step, steps_completed, completed, skipped } = body

    const supabase = await createClient()

    const updateData: Record<string, unknown> = {}
    if (typeof current_step === 'number') updateData['current_step'] = current_step
    if (Array.isArray(steps_completed)) updateData['steps_completed'] = steps_completed
    if (typeof completed === 'boolean') {
      updateData['completed'] = completed
      if (completed) updateData['completed_at'] = new Date().toISOString()
    }
    if (typeof skipped === 'boolean') updateData['skipped'] = skipped

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

export const GET = createSecureHandler(getHandler, 'GET /api/onboarding', SecurityPresets.enhanced())
export const PATCH = createSecureHandler(patchHandler, 'PATCH /api/onboarding', SecurityPresets.enhanced())
