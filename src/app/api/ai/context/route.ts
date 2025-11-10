// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// API Route: Business Context Loading

import { type NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { createSecureHandler, InputSanitizer, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/ai/context - Load business context for AI chat
 */
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {searchParams} = request.nextUrl;
    const rawPage = searchParams.get('page') ?? undefined;
    const sanitizedPage = rawPage ? InputSanitizer.sanitizeHtml(rawPage).slice(0, 200).trim() : undefined;
    const currentPage = sanitizedPage && sanitizedPage.length > 0 ? sanitizedPage : undefined;

    const context = await BusinessContextService.loadContext(
      user['id'],
      currentPage
    );

    return NextResponse.json({
      context,
      cached: false, // Cache detection not yet implemented
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
async function deleteHandler(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await BusinessContextService.invalidateCache(user['id']);

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

export const GET = createSecureHandler(getHandler, 'GET /api/ai/context', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/ai/context', SecurityPresets.enhanced())
