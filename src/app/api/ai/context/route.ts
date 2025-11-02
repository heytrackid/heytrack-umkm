// API Route: Business Context Loading

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { logger } from '@/lib/logger';

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * GET /api/ai/context - Load business context for AI chat
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
    const currentPage = searchParams.get('page') ?? undefined;

    const context = await BusinessContextService.loadContext(
      user.id,
      currentPage
    );

    return NextResponse.json({
      context,
      cached: false, // TODO: Implement cache detection
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to load context: ${errorMessage}`);
    return NextResponse.json(
      { error: 'Failed to load context' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/context - Invalidate context cache
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await BusinessContextService.invalidateCache(user.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to invalidate context: ${errorMessage}`);
    return NextResponse.json(
      { error: 'Failed to invalidate context' },
      { status: 500 }
    );
  }
}
