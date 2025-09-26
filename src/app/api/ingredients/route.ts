import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/ingredients - Get all ingredients
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching ingredients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ingredients' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/ingredients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/ingredients - Create new ingredient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.unit || body.price_per_unit === undefined) {
      return NextResponse.json(
        { error: 'Name, unit, and price_per_unit are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ingredients')
      .insert(body)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating ingredient:', error)
      return NextResponse.json(
        { error: 'Failed to create ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/ingredients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}