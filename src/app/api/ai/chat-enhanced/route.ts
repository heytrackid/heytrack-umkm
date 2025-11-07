// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


/**
 * Enhanced AI Chat API with Context Awareness and Session Persistence
 */

import { type NextRequest, NextResponse } from 'next/server';

import { ContextAwareAI } from '@/lib/ai-chatbot-enhanced';
import { APIError } from '@/lib/errors/api-error-handler';
import { logger } from '@/lib/logger';
import { AIFallbackService } from '@/lib/services/AIFallbackService';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { ChatSessionService } from '@/lib/services/ChatSessionService';
import { RateLimiter, RATE_LIMITS } from '@/lib/services/RateLimiter';
import { SuggestionEngine } from '@/lib/services/SuggestionEngine';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

async function authenticateUser(supabase: ReturnType<typeof createClient>): Promise<{ userId: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' });
  }

  return { userId: user['id'] };
}

function checkRateLimits(userId: string): void {
  // Rate limiting - per minute
  const rateLimitKey = `ai-chat:${userId}`;
  if (!RateLimiter.check(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests, RATE_LIMITS.AI_CHAT.windowMs)) {
    const resetTime = RateLimiter.getResetTime(rateLimitKey);
    const remaining = RateLimiter.getRemaining(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests);

    logger.warn({ userId, remaining, resetTime }, 'AI chat rate limit exceeded');

    throw new APIError(
      'Terlalu banyak permintaan. Silakan tunggu sebentar.',
      { status: 429, code: 'RATE_LIMIT_EXCEEDED' }
    );
  }

  // Rate limiting - per hour
  const hourlyRateLimitKey = `ai-chat-hourly:${userId}`;
  if (!RateLimiter.check(hourlyRateLimitKey, RATE_LIMITS.AI_CHAT_HOURLY.maxRequests, RATE_LIMITS.AI_CHAT_HOURLY.windowMs)) {
    throw new APIError(
      'Anda telah mencapai batas maksimal chat per jam. Silakan coba lagi nanti.',
      { status: 429, code: 'RATE_LIMIT_EXCEEDED' }
    );
  }
}

function validateAndSanitizeMessage(message: string, userId: string): string {
  if (!message || typeof message !== 'string') {
    throw new APIError('Message is required', { status: 400 });
  }

  // Sanitize message - prevent injection attacks
  const sanitizedMessage = message
    .trim()
    .substring(0, 2000) // Max 2000 characters
    .split('').filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join(''); // Remove control characters

  if (sanitizedMessage.length === 0) {
    throw new APIError('Message cannot be empty', { status: 400 });
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
  ];

  const containsSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(sanitizedMessage));

  if (containsSuspiciousPattern) {
    logger.warn(
      { userId, message: sanitizedMessage.substring(0, 100) },
      'Potential prompt injection attempt detected'
    );
    // Don't reject, but log for monitoring
  }

  return sanitizedMessage;
}

async function handleSession(userId: string, sessionId: string | undefined, message: string, currentPage?: string): Promise<string> {
  if (sessionId) {return sessionId;}

  const context = await BusinessContextService.loadContext(userId, currentPage);
  const title = ChatSessionService.generateTitle(message);
  const session = await ChatSessionService.createSession(userId, title, context);
  return session['id'];
}

async function processAIResponse(userId: string, sessionId: string, sanitizedMessage: string, currentPage?: string): Promise<{ aiResponse: string; fallbackUsed: boolean }> {
  const context = await BusinessContextService.loadContext(userId, currentPage);

  const fallbackResult = await AIFallbackService.getResponseWithFallback(
    sanitizedMessage,
    context,
    async () => {
      const ai = new ContextAwareAI(userId, sessionId);
      await ai.initializeSession();
      const result = await ai.processQuery(sanitizedMessage, context as Record<string, unknown>);
      return result.content || '';
    }
  );

  return { aiResponse: fallbackResult.response, fallbackUsed: fallbackResult.fallbackUsed };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { userId } = await authenticateUser(supabase);

    await checkRateLimits(userId);

    const body = await request.json() as { message: string; session_id?: string; currentPage?: string };
    const { message, session_id, currentPage } = body;

    const sanitizedMessage = validateAndSanitizeMessage(message, userId);

    const sessionId = await handleSession(userId, session_id, message, currentPage);

    await ChatSessionService.addMessage(sessionId, 'user', sanitizedMessage);

    const { aiResponse, fallbackUsed } = await processAIResponse(userId, sessionId, sanitizedMessage, currentPage);

    const responseTime = Date.now() - startTime;
    await ChatSessionService.addMessage(sessionId, 'assistant', aiResponse, {
      response_time_ms: responseTime,
      fallback_used: fallbackUsed,
    });

    const context = await BusinessContextService.loadContext(userId, currentPage);
    const suggestions = SuggestionEngine.generateSuggestions(context);

    logger.info(`Chat message processed - User: ${userId}, Session: ${sessionId}, Response time: ${responseTime}ms, Fallback: ${fallbackUsed}`);

    return NextResponse.json({
      message: aiResponse,
      session_id: sessionId,
      suggestions,
      metadata: {
        response_time_ms: responseTime,
        fallback_used: fallbackUsed,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error in enhanced chat API: ${errorMessage}`);

    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
