// WhatsApp Templates API - Single Template Operations
// GET: Get single template
// PUT: Update template
// DELETE: Delete template

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

type WhatsAppTemplateUpdate = Database['public']['Tables']['whatsapp_templates']['Update']

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Query template with ownership check
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (error) {
      apiLogger.error({ error, userId: user.id, templateId: id }, 'Failed to fetch template')
      throw error
    }

    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/whatsapp-templates/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse body
    const body = await request.json()

    // 3. If setting as default, unset other defaults in same category
    if (body.is_default && body.category) {
      await supabase
        .from('whatsapp_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('category', body.category)
        .neq('id', id)
    }

    // 4. Update template with ownership check
    const updateData: WhatsAppTemplateUpdate = {
      name: body.name,
      description: body.description,
      category: body.category,
      template_content: body.template_content,
      variables: body.variables,
      is_active: body.is_active,
      is_default: body.is_default,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('whatsapp_templates')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (error) {
      apiLogger.error({ error, userId: user.id, templateId: id }, 'Failed to update template')
      throw error
    }

    apiLogger.info({ userId: user.id, templateId: id }, 'WhatsApp template updated')
    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/whatsapp-templates/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Delete template with ownership check
    const { error } = await supabase
      .from('whatsapp_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (error) {
      apiLogger.error({ error, userId: user.id, templateId: id }, 'Failed to delete template')
      throw error
    }

    apiLogger.info({ userId: user.id, templateId: id }, 'WhatsApp template deleted')
    return NextResponse.json({ message: 'Template deleted successfully' })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/whatsapp-templates/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
