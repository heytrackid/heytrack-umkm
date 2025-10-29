/**
 * Enhanced AI Chat API with Context Awareness and Session Persistence
 */

import { type NextRequest, NextResponse } from 'next/server';
import { ContextAwareAI } from '@/lib/ai-chatbot-enhanced';
import { ChatSessionService } from '@/lib/services/ChatSessionService';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { SuggestionEngine } from '@/lib/services/SuggestionEngine';
import { AIFallbackService } from '@/lib/services/AIFallbackService';
import { RateLimiter, RATE_LIMITS } from '@/lib/services/RateLimiter';
import { logger } from '@/lib/logger';
import { createClient } from '@/utils/supabase/server';
import { APIError } from '@/lib/errors/api-error-handler';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED');
    }

    // Rate limiting - per minute
    const rateLimitKey = `ai-chat:${user.id}`;
    if (!RateLimiter.check(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests, RATE_LIMITS.AI_CHAT.windowMs)) {
      const resetTime = RateLimiter.getResetTime(rateLimitKey);
      const remaining = RateLimiter.getRemaining(rateLimitKey, RATE_LIMITS.AI_CHAT.maxRequests);
      
      logger.warn(
        { userId: user.id, remaining, resetTime },
        'AI chat rate limit exceeded'
      );
      
      throw new APIError(
        'Terlalu banyak permintaan. Silakan tunggu sebentar.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Rate limiting - per hour
    const hourlyRateLimitKey = `ai-chat-hourly:${user.id}`;
    if (!RateLimiter.check(hourlyRateLimitKey, RATE_LIMITS.AI_CHAT_HOURLY.maxRequests, RATE_LIMITS.AI_CHAT_HOURLY.windowMs)) {
      throw new APIError(
        'Anda telah mencapai batas maksimal chat per jam. Silakan coba lagi nanti.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const body = await request.json();
    const { message, session_id, currentPage } = body;

    // Input validation and sanitization
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize message - prevent injection attacks
    const sanitizedMessage = message
      .trim()
      .substring(0, 2000) // Max 2000 characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters

    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Detect potential prompt injection attempts
    const suspiciousPatterns = [
      /ignore\s+(previous|all|above)\s+instructions?/i,
      /forget\s+(everything|all|previous)/i,
      /you\s+are\s+now/i,
      /new\s+instructions?:/i,
      /system\s*:\s*/i,
      /\[SYSTEM\]/i,
      /\<\|im_start\|\>/i,
      /\<\|im_end\|\>/i,
    ];

    const containsSuspiciousPattern = suspiciousPatterns.some(pattern =>
      pattern.test(sanitizedMessage)
    );

    if (containsSuspiciousPattern) {
      logger.warn(
        { userId: user.id, message: sanitizedMessage.substring(0, 100) },
        'Potential prompt injection attempt detected'
      );
      // Don't reject, but log for monitoring
    }

    // Get or create session
    let sessionId = session_id;
    if (!sessionId) {
      const context = await BusinessContextService.loadContext(
        user.id,
        currentPage
      );
      const title = ChatSessionService.generateTitle(message);
      const session = await ChatSessionService.createSession(
        user.id,
        title,
        context
      );
      sessionId = session.id;
    }

    // Save user message (use sanitized version)
    await ChatSessionService.addMessage(sessionId, 'user', sanitizedMessage);

    // Load business context
    const context = await BusinessContextService.loadContext(
      user.id,
      currentPage
    );

    // Get AI response with fallback (use sanitized message)
    const fallbackResult = await AIFallbackService.getResponseWithFallback(
        sanitizedMessage,
        context,
        async () => {
          const ai = new ContextAwareAI(user.id, sessionId);
          await ai.initializeSession();
          const result = await ai.processQuery(sanitizedMessage, context as Record<string, unknown>);
          return result.content || '';
        }
      );
    const aiResponse = fallbackResult.response;
    const {fallbackUsed} = fallbackResult;

    // Save assistant message
    const responseTime = Date.now() - startTime;
    await ChatSessionService.addMessage(sessionId, 'assistant', aiResponse, {
      response_time_ms: responseTime,
      fallback_used: fallbackUsed,
    });

    // Generate suggestions
    const suggestions = SuggestionEngine.generateSuggestions(context);

    logger.info(`Chat message processed - User: ${user.id}, Session: ${sessionId}, Response time: ${responseTime}ms, Fallback: ${fallbackUsed}`);

    return NextResponse.json({
      message: aiResponse,
      session_id: sessionId,
      suggestions,
      metadata: {
        response_time_ms: responseTime,
        fallback_used: fallbackUsed,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error in enhanced chat API: ${errorMessage}`);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
