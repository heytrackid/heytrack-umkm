/**
 * Enhanced AI Chat API with Context Awareness and Session Persistence
 */

import { type NextRequest, NextResponse } from 'next/server';
import { ContextAwareAI } from '@/lib/ai-chatbot-enhanced';
import { ChatSessionService } from '@/lib/services/ChatSessionService';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { SuggestionEngine } from '@/lib/services/SuggestionEngine';
import { AIFallbackService } from '@/lib/services/AIFallbackService';
import { logger } from '@/lib/logger';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/supabase-generated';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, session_id, currentPage } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
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

    // Save user message
    await ChatSessionService.addMessage(sessionId, 'user', message);

    // Load business context
    const context = await BusinessContextService.loadContext(
      user.id,
      currentPage
    );

    // Get AI response with fallback
    const fallbackResult = await AIFallbackService.getResponseWithFallback(
        message,
        context,
        async () => {
          const ai = new ContextAwareAI(user.id, sessionId);
          await ai.initializeSession();
          const result = await ai.processQuery(message);
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
