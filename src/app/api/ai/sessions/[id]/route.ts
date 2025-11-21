// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * AI Chat Sessions API - Get/Delete specific session
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core/responses'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { typed } from '@/types/type-utilities'
import { createSecureRouteHandler, SecurityPresets } from '@/utils/security/index'
import type { Json } from '@/types/database'

import { createClient } from '@/utils/supabase/server'

const SaveMessageBodySchema = z.object({
  role: z.string().refine((val) => ['assistant', 'system', 'user'].includes(val), {
    message: 'Role must be assistant, system, or user'
  }),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional()
})

async function getHandler(_request: NextRequest, { params }: { params: Promise<Record<string, string>> }): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const resolvedParams = await params
    const id = resolvedParams?.['id']
    if (!id) {
      return createErrorResponse('ID is required', 400)
    }
    const sessionId = id

    // Get session and messages
    const [session, messages] = await Promise.all([
      ChatSessionService.getSession(typed(supabase), sessionId, user.id),
      ChatSessionService.getMessages(typed(supabase), sessionId, user.id),
    ])

    apiLogger.info(
      { userId: user.id, sessionId, messageCount: messages.length },
      'Session loaded'
    )

    return createSuccessResponse({ session, messages })
  } catch (error) {
    return handleAPIError(error)
  }
}

async function postHandler(request: NextRequest, { params }: { params: Promise<Record<string, string>> }): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const { id } = await params
    if (!id) {
      return createErrorResponse('ID is required', 400)
    }
    const sessionId = id

    // Parse body
    const body = await request.json()
    const validation = SaveMessageBodySchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse('Invalid request body', 400)
    }
    const { role, content, metadata } = validation.data

    // Save message
    const { error } = await typed(supabase)
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role,
        content,
        metadata: metadata as Json
      })

    if (error) {
      throw error
    }

    // Update session's updated_at
    await typed(supabase)
      .from('chat_sessions')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    apiLogger.info({ userId: user.id, sessionId }, 'Message saved')
    return createSuccessResponse(null, 'Message saved successfully')
  } catch (error) {
    return handleAPIError(error)
  }
}

async function deleteHandler(_request: NextRequest, { params }: { params: Promise<Record<string, string>> }): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const { id } = await params
    if (!id) {
      return createErrorResponse('ID is required', 400)
    }
    const sessionId = id

    // Delete session
    await ChatSessionService.deleteSession(typed(supabase), sessionId, user.id)

    apiLogger.info({ userId: user.id, sessionId }, 'Session deleted')
    return createSuccessResponse(null, 'Session deleted successfully')
  } catch (error) {
    return handleAPIError(error)
  }
}

export const GET = createSecureRouteHandler(getHandler, 'GET /api/ai/sessions/[id]', SecurityPresets.enhanced())
export const POST = createSecureRouteHandler(postHandler, 'POST /api/ai/sessions/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureRouteHandler(deleteHandler, 'DELETE /api/ai/sessions/[id]', SecurityPresets.enhanced())
