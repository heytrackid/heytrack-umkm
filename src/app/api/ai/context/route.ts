// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// API Route: Business Context Loading

import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { createSecureHandler, InputSanitizer, SecurityPresets } from '@/utils/security/index';

/**
 * GET /api/ai/context - Load business context for AI chat
 */
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const {searchParams} = request.nextUrl;
    const rawPage = searchParams.get('page') ?? undefined;
    const sanitizedPage = rawPage ? InputSanitizer.sanitizeHtml(rawPage).slice(0, 200).trim() : undefined;
    const currentPage = sanitizedPage && sanitizedPage.length > 0 ? sanitizedPage : undefined;

    const context = await BusinessContextService.loadContext(
      user.id,
      currentPage
    );

    return NextResponse.json({
      context,
      cached: false, // Cache detection not yet implemented
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Failed to load context');
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
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    await BusinessContextService.invalidateCache(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Failed to invalidate context');
    return NextResponse.json(
      { error: 'Failed to invalidate context' },
      { status: 500 }
    );
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/ai/context', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/ai/context', SecurityPresets.enhanced())
