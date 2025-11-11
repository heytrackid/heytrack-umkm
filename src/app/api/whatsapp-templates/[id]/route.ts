// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// WhatsApp Templates API - Single Template Operations
// GET: Get single template
// PUT: Update template
// DELETE: Delete template

import { NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import type { Update } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

type WhatsAppTemplateUpdate = Update<'whatsapp_templates'>

async function getHandler(
  _request: NextRequest,
  { params }: { params: Record<string, string> }
): Promise<NextResponse> {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Query template with ownership check
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('id, user_id, name, message, is_active, created_at, updated_at')
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

async function putHandler(
  request: NextRequest,
  { params }: { params: Record<string, string> }
): Promise<NextResponse> {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse body
    const _body = await request.json() as {
      name?: string
      description?: string
      category?: string
      template_content?: string
      variables?: string[]
      is_active?: boolean
      is_default?: boolean
    }

    // 3. If setting as default, unset other defaults in same category
    if (_body.is_default && _body.category) {
      await supabase
        .from('whatsapp_templates')
        .update({ is_default: false })
        .eq('user_id', user['id'])
        .eq('category', _body.category)
        .neq('id', id)
    }

    // 4. Update template with ownership check
    const updateData: WhatsAppTemplateUpdate = {
      ...(typeof _body.name === 'string' && { name: _body.name }),
      ...(typeof _body.description === 'string' && { description: _body.description }),
      ...(typeof _body.category === 'string' && { category: _body.category }),
      ...(typeof _body.template_content === 'string' && { template_content: _body.template_content }),
      ...(Array.isArray(_body.variables) && { variables: _body.variables }),
      ...(typeof _body.is_active === 'boolean' && { is_active: _body.is_active }),
      ...(typeof _body.is_default === 'boolean' && { is_default: _body.is_default }),
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
      apiLogger.error({ error, userId: user['id'], templateId: id }, 'Failed to update template')
      throw error
    }

    apiLogger.info({ userId: user['id'], templateId: id }, 'WhatsApp template updated')
    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/whatsapp-templates/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteHandler(
  _request: NextRequest,
  { params }: { params: Record<string, string> }
): Promise<NextResponse> {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

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

    apiLogger.info({ userId: user['id'], templateId: id }, 'WhatsApp template deleted')
    return NextResponse.json({ message: 'Template deleted successfully' })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/whatsapp-templates/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/whatsapp-templates/[id]', SecurityPresets.enhanced())
export const PUT = createSecureHandler(putHandler, 'PUT /api/whatsapp-templates/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/whatsapp-templates/[id]', SecurityPresets.enhanced())
