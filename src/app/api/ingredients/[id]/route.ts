export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { IngredientUpdateSchema } from '@/lib/validations/domains/ingredients'
import type { IngredientUpdate } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type _IngredientUpdate = IngredientUpdate

async function GET(
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

    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Bahan baku tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/ingredients/[id]')
  }
}

async function PUT(
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

    // Validate input
    const validation = IngredientUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Data tidak valid',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ingredients')
      .update(validation.data as never)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Bahan baku tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleAPIError(error, 'PUT /api/ingredients/[id]')
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
      .from('ingredients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Bahan baku berhasil dihapus' })
  } catch (error) {
    return handleAPIError(error, 'DELETE /api/ingredients/[id]')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())
const securedDELETE = withSecurity(DELETE, SecurityPresets.enhanced())

export { securedDELETE as DELETE, securedGET as GET, securedPUT as PUT }

