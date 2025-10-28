// API Route: Dynamic Chat Suggestions

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BusinessContextService } from '@/lib/services/BusinessContextService';
import { SuggestionEngine } from '@/lib/services/SuggestionEngine';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/supabase-generated';

/**
 * GET /api/ai/suggestions - Get dynamic chat suggestions
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
    const currentPage = searchParams.get('page') || undefined;
    const maxSuggestions = parseInt(
      searchParams.get('limit') || '4'
    );

    // Load business context
    const context = await BusinessContextService.loadContext(
      user.id,
      currentPage
    );

    // Generate suggestions
    const suggestions = SuggestionEngine.generateSuggestions(
      context,
      maxSuggestions
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to generate suggestions: ${errorMessage}`);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
