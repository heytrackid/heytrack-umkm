// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


// WhatsApp Templates API - List & Create
// GET: List all templates for authenticated user
// POST: Create new template

import { NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import type { Insert } from '@/types/database'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'



type WhatsAppTemplateInsert = Insert<'whatsapp_templates'>

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    // 3. Query templates
    let query = supabase
      .from('whatsapp_templates')
      .select('id, user_id, name, message, is_active, created_at, updated_at')
      .eq('user_id', user['id'])
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to fetch WhatsApp templates')
      throw error
    }

    apiLogger.info({ userId: user['id'], count: data.length }, 'WhatsApp templates fetched')
    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/whatsapp-templates')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    // 2. Parse and validate body
    const _body = await request.json() as {
      name?: string
      template_content?: string
      category?: string
      description?: string
      variables?: string[]
      is_active?: boolean
      is_default?: boolean
    }

    if (!_body.name || !_body.template_content || !_body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, template_content, category' },
        { status: 400 }
      )
    }

    // 3. If setting as default, unset other defaults
    if (_body.is_default) {
      await supabase
        .from('whatsapp_templates')
        .update({ is_default: false })
        .eq('user_id', user['id'])
        .eq('category', _body.category)
    }

    // 4. Insert template
    const templateData: WhatsAppTemplateInsert = {
      name: _body.name,
      description: _body.description ?? '',
      category: _body.category,
      template_content: _body.template_content,
      variables: _body.variables ?? [],
      is_active: _body.is_active ?? true,
      is_default: _body.is_default ?? false,
      user_id: user['id']
    }

    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to create WhatsApp template')
      throw error
    }

    apiLogger.info({ userId: user['id'], templateId: data['id'] }, 'WhatsApp template created')
    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/whatsapp-templates')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST }
