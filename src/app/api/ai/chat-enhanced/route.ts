// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * Enhanced AI Chat API with Context Awareness and Session Persistence
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'


import { ContextAwareAI } from '@/lib/ai-chatbot-enhanced'
import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { logger } from '@/lib/logger'
import { AIFallbackService } from '@/lib/services/AIFallbackService'
import { BusinessContextService } from '@/lib/services/BusinessContextService'
import { ChatSessionService } from '@/lib/services/ChatSessionService'
import { RateLimiter, RATE_LIMITS } from '@/lib/services/RateLimiter'
import { SuggestionEngine } from '@/lib/services/SuggestionEngine'
import type { Database } from '@/types/database'
import { APISecurity, InputSanitizer, SecurityPresets, withSecurity } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'

import type { SupabaseClient } from '@supabase/supabase-js'

export const maxDuration = 30

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  session_id: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid session id')
    .optional(),
  currentPage: z.string().trim().max(200).optional()
}).strict()

async function authenticateUser(supabase: SupabaseClient<Database>): Promise<{ userId: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
  }

  return { userId: user['id'] }
}

function checkRateLimits(userId: string): void {
  // Rate limiting - per minute
  const rateLimitKey = `ai-chat:${userId}`
  if (!RateLimiter.check(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests, RATE_LIMITS.AI_CHAT.windowMs)) {
    const resetTime = RateLimiter.getResetTime(rateLimitKey)
    const remaining = RateLimiter.getRemaining(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests)

    logger.warn({ userId, remaining, resetTime }, 'AI chat rate limit exceeded')

    throw new APIError(
      'Terlalu banyak permintaan. Silakan tunggu sebentar.',
      { status: 429, code: 'RATE_LIMIT_EXCEEDED' }
    )
  }

  // Rate limiting - per hour
  const hourlyRateLimitKey = `ai-chat-hourly:${userId}`
  if (!RateLimiter.check(hourlyRateLimitKey, RATE_LIMITS.AI_CHAT_HOURLY.maxRequests, RATE_LIMITS.AI_CHAT_HOURLY.windowMs)) {
    throw new APIError(
      'Anda telah mencapai batas maksimal chat per jam. Silakan coba lagi nanti.',
      { status: 429, code: 'RATE_LIMIT_EXCEEDED' }
    )
  }
}

function validateAndSanitizeMessage(message: string, userId: string): string {
  if (!message || typeof message !== 'string') {
    throw new APIError('Message is required', { status: 400 })
  }

  // Sanitize message - prevent injection attacks
  let sanitizedMessage = message
    .trim()
    .substring(0, 2000) // Max 2000 characters
    .split('')
    .filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
    .join('')

  sanitizedMessage = InputSanitizer.sanitizeHtml(sanitizedMessage)

  if (sanitizedMessage.length === 0) {
    throw new APIError('Message cannot be empty', { status: 400 })
  }

  // Detect potential prompt injection attempts
  const suspiciousPatterns = [
    /ignore\s+(previous|all|above)\s+instructions?/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /\[SYSTEM\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
  ]

  const containsSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(sanitizedMessage))

  if (containsSuspiciousPattern) {
    logger.warn(
      { userId, message: sanitizedMessage.substring(0, 100) },
      'Potential prompt injection attempt detected'
    )
    // Don't reject, but log for monitoring
  }

  return sanitizedMessage
}

async function handleSession(userId: string, sessionId: string | undefined, message: string, currentPage?: string): Promise<string> {
  if (sessionId) {return sessionId}

  const context = await BusinessContextService.loadContext(userId, currentPage)
  const title = ChatSessionService.generateTitle(message)
  const session = await ChatSessionService.createSession(userId, title, context)
  return session['id']
}

async function processAIResponse(
  userId: string,
  sessionId: string,
  sanitizedMessage: string,
  currentPage?: string
): Promise<{ aiResponse: string; fallbackUsed: boolean }> {
  const context = await BusinessContextService.loadContext(userId, currentPage)

  const fallbackResult = await AIFallbackService.getResponseWithFallback(
    sanitizedMessage,
    context,
    async () => {
      const ai = new ContextAwareAI(userId, sessionId)
      await ai.initializeSession()
      const result = await ai.processQuery(sanitizedMessage, context as Record<string, unknown>)
      return result.content || ''
    }
  )

  return { aiResponse: fallbackResult.response, fallbackUsed: fallbackResult.fallbackUsed }
}

async function chatEnhancedPOST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { userId } = await authenticateUser(supabase)

    await checkRateLimits(userId)

    const sanitizedBody = APISecurity.sanitizeRequestBody(await request.json())
    const { message, session_id, currentPage } = ChatRequestSchema.parse(sanitizedBody)

    const sanitizedMessage = validateAndSanitizeMessage(message, userId)
    const safeSessionId = session_id ? InputSanitizer.sanitizeSQLInput(session_id) : undefined
    const safeCurrentPage = currentPage
      ? (() => {
          const sanitized = InputSanitizer.sanitizeHtml(currentPage).slice(0, 200).trim()
          return sanitized.length ? sanitized : undefined
        })()
      : undefined

    const sessionId = await handleSession(userId, safeSessionId, sanitizedMessage, safeCurrentPage)

    await ChatSessionService.addMessage(sessionId, 'user', sanitizedMessage)

    const { aiResponse, fallbackUsed } = await processAIResponse(userId, sessionId, sanitizedMessage, safeCurrentPage)

    const responseTime = Date.now() - startTime
    await ChatSessionService.addMessage(sessionId, 'assistant', aiResponse, {
      response_time_ms: responseTime,
      fallback_used: fallbackUsed,
    })

    const context = await BusinessContextService.loadContext(userId, safeCurrentPage)
    const suggestions = SuggestionEngine.generateSuggestions(context)

    logger.info(`Chat message processed - User: ${userId}, Session: ${sessionId}, Response time: ${responseTime}ms, Fallback: ${fallbackUsed}`)

    return NextResponse.json({
      message: aiResponse,
      session_id: sessionId,
      suggestions,
      metadata: {
        response_time_ms: responseTime,
        fallback_used: fallbackUsed,
      },
    })
  } catch (error) {
    logger.error({ error }, 'Error in AI chat')
    return handleAPIError(error, 'POST /api/ai/chat-enhanced')
  }
}

export const POST = withSecurity(chatEnhancedPOST, SecurityPresets.enhanced())
