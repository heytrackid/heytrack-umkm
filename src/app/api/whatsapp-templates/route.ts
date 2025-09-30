import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('param')
    const isActive = searchParams.get('param')
    
    let query = supabase
      .from('whatsapp_templates')
      .select('*')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    
    query = query.order('is_default', { ascending: false })
              .order('name', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching WhatsApp templates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in WhatsApp templates API:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { name, description, category, template_content, variables, is_active, is_default } = body
    
    if (!name || !template_content || !category) {
      return NextResponse.json({ 
        error: 'Name, template content, and category are required' 
      }, { status: 400 })
    }
    
    // If this is set as default, unset other defaults in the same category
    if (is_default) {
      await supabase
        .from('whatsapp_templates')
        .update({ is_default: false })
        .eq('category', category)
        .eq('is_default', true)
    }
    
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert([{
        name,
        description,
        category,
        template_content,
        variables: variables || [],
        is_active: is_active !== undefined ? is_active : true,
        is_default: is_default || false
      }])
      .select('*')
    
    if (error) {
      console.error('Error creating WhatsApp template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error in WhatsApp templates POST API:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}