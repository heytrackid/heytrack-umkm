import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/ingredients/[id] - Get single ingredient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ingredient not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching ingredient:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/ingredients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/ingredients/[id] - Update ingredient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('ingredients')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ingredient not found' },
          { status: 404 }
        )
      }
      console.error('Error updating ingredient:', error)
      return NextResponse.json(
        { error: 'Failed to update ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/ingredients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/ingredients/[id] - Delete ingredient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting ingredient:', error)
      return NextResponse.json(
        { error: 'Failed to delete ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Ingredient deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/ingredients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}