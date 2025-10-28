// API Route: Chat Sessions Management

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ChatSessionService } from '@/lib/services/ChatSessionService';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { logger } from '@/lib/logger';

/**
 * GET /api/ai/sessions - List user's chat sessions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {searchParams} = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '20');

    const sessions = await ChatSessionService.listSessions(user.id, limit);

    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to list sessions: ${errorMessage}`);
    return NextResponse.json(
      { error: 'Failed to list sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/sessions - Create new chat session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, currentPage } = body;

    // Load business context for snapshot
    const context = await BusinessContextService.loadContext(
      user.id,
      currentPage
    );

    // Create session
    const session = await ChatSessionService.createSession(
      user.id,
      title || 'New Conversation',
      context
    );

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to create session: ${errorMessage}`);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
