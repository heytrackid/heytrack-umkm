export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { hppRecommendationUpdateSchema } from '@/lib/validations/domains/hpp'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { id } = params
    const body = await request.json()
    const validation = hppRecommendationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData = {
      ...(validation.data.title && { title: validation.data.title }),
      ...(validation.data.description && { description: validation.data.description }),
      ...(validation.data.potentialSavings !== undefined && { potential_savings: validation.data.potentialSavings }),
      ...(validation.data.priority && { priority: validation.data.priority }),
      ...(validation.data.isImplemented !== undefined && { is_implemented: validation.data.isImplemented }),
    }

    const { data, error } = await supabase
      .from('hpp_recommendations')
      .update(updateData as never)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'PATCH /api/hpp/recommendations/[id]')
  }
}

async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { id } = params
    const supabase = await createClient()

    const { error } = await supabase
      .from('hpp_recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAPIError(error, 'DELETE /api/hpp/recommendations/[id]')
  }
}

const securedPATCH = withSecurity(PATCH, SecurityPresets.enhanced())
const securedDELETE = withSecurity(DELETE, SecurityPresets.enhanced())

export { securedDELETE as DELETE, securedPATCH as PATCH }

