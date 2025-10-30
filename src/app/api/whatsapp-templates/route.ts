// WhatsApp Templates API - List & Create
// GET: List all templates for authenticated user
// POST: Create new template

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type WhatsAppTemplateInsert = Database['public']['Tables']['whatsapp_templates']['Insert']

export async function GET(request: NextRequest) {
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
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to fetch WhatsApp templates')
      throw error
    }

    apiLogger.info({ userId: user.id, count: data.length }, 'WhatsApp templates fetched')
    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/whatsapp-templates')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate body
    const body = await request.json()
    
    if (!body.name || !body.template_content || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, template_content, category' },
        { status: 400 }
      )
    }

    // 3. If setting as default, unset other defaults
    if (body.is_default) {
      await supabase
        .from('whatsapp_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('category', body.category)
    }

    // 4. Insert template
    const templateData: WhatsAppTemplateInsert = {
      name: body.name,
      description: body.description || '',
      category: body.category,
      template_content: body.template_content,
      variables: body.variables || [],
      is_active: body.is_active ?? true,
      is_default: body.is_default ?? false,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Failed to create WhatsApp template')
      throw error
    }

    apiLogger.info({ userId: user.id, templateId: data.id }, 'WhatsApp template created')
    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/whatsapp-templates')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
