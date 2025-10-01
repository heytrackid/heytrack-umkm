import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      console.error('Error fetching WhatsApp template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in WhatsApp template GET API:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { name, description, category, template_content, variables, is_active, is_default } = body
    
    // If this is set as default, unset other defaults in the same category
    if (is_default) {
      await supabase
        .from('whatsapp_templates')
        .update({ is_default: false })
        .eq('category', category)
        .eq('is_default', true)
        .neq('id', id)
    }
    
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .update({
        name,
        description,
        category,
        template_content,
        variables: variables || [],
        is_active,
        is_default
      })
      .eq('id', id)
      .select('*')
    
    if (error) {
      console.error('Error updating WhatsApp template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in WhatsApp template PUT API:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id)
      .select('*')
    
    if (error) {
      console.error('Error deleting WhatsApp template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error in WhatsApp template DELETE API:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}