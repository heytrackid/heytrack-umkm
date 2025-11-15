export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/onboarding - Get onboarding status
async function GET(_request: NextRequest): Promise<NextResponse> {
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
      .select('*')
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
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({
        success: true,
        data: newOnboarding,
      })
    }

    return NextResponse.json({
      success: true,
      data: onboarding,
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/onboarding')
  }
}

// PATCH /api/onboarding - Update onboarding progress
async function PATCH(request: NextRequest): Promise<NextResponse> {
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
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Onboarding progress updated',
    })
  } catch (error) {
    return handleAPIError(error, 'PATCH /api/onboarding')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPATCH = withSecurity(PATCH, SecurityPresets.enhanced())

export { securedGET as GET, securedPATCH as PATCH }
