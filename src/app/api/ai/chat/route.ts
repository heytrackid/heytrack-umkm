export const runtime = 'nodejs'
export const maxDuration = 30

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { ContextAwareAI } from '@/lib/ai-chatbot-context'
import { AIFallbackService } from '@/lib/services/AIFallbackService'
import { BusinessContextService } from '@/lib/services/BusinessContextService'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { RateLimiter, RATE_LIMITS } from '@/lib/services/RateLimiter'
import { SuggestionEngine } from '@/lib/services/SuggestionEngine'
import { InputSanitizer } from '@/utils/security/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core/responses'

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  session_id: z.string().optional().nullable(),
  currentPage: z.string().optional().nullable()
}).strict()

/**
 * Validate and sanitize message for security
 */
function validateMessage(message: string, userId: string): string {
  const sanitized = InputSanitizer.sanitizeHtml(message)
    .split('')
    .filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
    .join('')

  if (sanitized.length === 0) {
    throw new Error('Message cannot be empty')
  }

  // Security patterns check
  const suspiciousPatterns = [
    /ignore\s+(previous|all|above)\s+instructions?/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /\[SYSTEM\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /override.*settings/i,
    /bypass.*security/i,
    /admin.*mode/i,
    /root.*access/i,
    /sudo/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /require\s*\(/i,
    /import\s*\(/i,
    /union\s+select/i,
    /drop\s+table/i,
    /alter\s+table/i,
    /script.*alert/i,
    /javascript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    apiLogger.warn(
      { userId, message: sanitized.substring(0, 100) },
      'Potential security threat detected in AI chat input'
    )
    throw new Error('Input mengandung konten yang tidak diizinkan.')
  }

  // Spam patterns check
  const spamPatterns = [
    /(.)\1{10,}/,
    /\b(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/\S*)?/gi,
    /\b\d{10,}\b/g,
  ]

  if (spamPatterns.some(pattern => pattern.test(sanitized))) {
    apiLogger.warn({ userId }, 'Potential spam content detected')
    throw new Error('Input terdeteksi sebagai spam.')
  }

  const meaningfulContent = sanitized.replace(/[^\w\s]/g, '').trim()
  if (meaningfulContent.length < 1) {
    throw new Error('Pertanyaan harus mengandung kata yang bermakna.')
  }

  return sanitized
}

/**
 * Check rate limits for AI chat
 */
function checkRateLimits(userId: string): void {
  const rateLimitKey = `ai-chat:${userId}`
  if (!RateLimiter.check(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests, RATE_LIMITS.AI_CHAT.windowMs)) {
    const resetTime = RateLimiter.getResetTime(rateLimitKey)
    const remaining = RateLimiter.getRemaining(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests)

    apiLogger.warn({ userId, remaining, resetTime }, 'AI chat rate limit exceeded')
    throw new Error('Terlalu banyak permintaan. Silakan tunggu sebentar.')
  }

  const hourlyRateLimitKey = `ai-chat-hourly:${userId}`
  if (!RateLimiter.check(hourlyRateLimitKey, RATE_LIMITS.AI_CHAT_HOURLY.maxRequests, RATE_LIMITS.AI_CHAT_HOURLY.windowMs)) {
    throw new Error('Anda telah mencapai batas maksimal chat per jam. Silakan coba lagi nanti.')
  }
}

/**
 * POST /api/ai/chat - Process AI chat message
 */
async function chatHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof ChatRequestSchema>
): Promise<NextResponse> {
  const startTime = Date.now()
  const { user, supabase } = context

  if (!body) {
    apiLogger.error({ userId: user.id }, 'Missing request body')
    return createErrorResponse('Request body is required', 400)
  }

  try {
    // Rate limiting
    checkRateLimits(user.id)

    // Validate and sanitize message
    const { message, session_id, currentPage } = body
    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      return createErrorResponse('Message cannot be empty', 400)
    }
    const sanitizedMessage = validateMessage(trimmedMessage, user.id)
    const safeCurrentPage = currentPage
      ? InputSanitizer.sanitizeHtml(currentPage).slice(0, 200).trim() || undefined
      : undefined

    // Get or create session
    let sessionId = session_id
    if (!sessionId) {
      const title = ChatSessionService.generateTitle(sanitizedMessage)
      try {
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions' as never)
          .insert({
            user_id: user.id,
            title,
            context_snapshot: null
          } as never)
          .select('id')
          .single()

        if (sessionError || !session) {
          throw new Error('Failed to create session')
        }

        sessionId = (session as { id: string }).id
      } catch (error) {
        apiLogger.error({ error, userId: user.id }, 'Failed to create chat session')
        throw new Error('Failed to create session. Please try again.')
      }
    }

    // Save user message
    try {
      const { error: messageError } = await supabase
        .from('chat_messages' as never)
        .insert({
          session_id: sessionId,
          role: 'user',
          content: sanitizedMessage,
          metadata: null
        } as never)

      if (messageError) {
        throw messageError
      }
    } catch (error) {
      apiLogger.error({ error, sessionId }, 'Failed to save user message')
      // Continue anyway, don't break the chat
    }

    // Load business context
    const context = await BusinessContextService.loadContext(user.id, safeCurrentPage)

    // Process AI response with fallback
    const fallbackResult = await AIFallbackService.getResponseWithFallback(
      sanitizedMessage,
      context,
      async () => {
        const ai = new ContextAwareAI(user.id, sessionId)
        await ai.initializeSession()
        const result = await ai.processQuery(sanitizedMessage, context as Record<string, unknown>)
        return result.content || ''
      }
    )

    const responseTime = Date.now() - startTime

    // Save AI response
    try {
      const { error: messageError } = await supabase
        .from('chat_messages' as never)
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: fallbackResult.response,
          metadata: {
            response_time_ms: responseTime,
            fallback_used: fallbackResult.fallbackUsed,
          }
        } as never)

      if (messageError) {
        throw messageError
      }

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions' as never)
        .update({ updated_at: new Date().toISOString() } as never)
        .eq('id', sessionId)
        .eq('user_id', user.id)
    } catch (error) {
      apiLogger.error({ error, sessionId }, 'Failed to save AI response')
      // Continue anyway, don't break the chat
    }

    // Generate suggestions
    const suggestions = SuggestionEngine.generateSuggestions(context)

    apiLogger.info(
      {
        userId: user.id,
        sessionId,
        responseTime,
        fallbackUsed: fallbackResult.fallbackUsed
      },
      'POST /api/ai/chat - Success'
    )

    return createSuccessResponse({
      message: fallbackResult.response,
      session_id: sessionId,
      suggestions: suggestions.map(s => s.text),
      metadata: {
        response_time_ms: responseTime,
        fallback_used: fallbackResult.fallbackUsed,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Maaf, terjadi kesalahan saat memproses permintaan Anda.'
    apiLogger.error({ error, userId: user.id }, 'POST /api/ai/chat - Error')

    const statusCode = error instanceof Error && error.message.includes('rate limit') ? 429 : 500
    return createErrorResponse(errorMessage, statusCode)
  }
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ai/chat',
    bodySchema: ChatRequestSchema,
    requireAuth: true,
  },
  chatHandler
)
