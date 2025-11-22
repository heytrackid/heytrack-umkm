// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import type { ChatRequest, RecipeGenerationRequest } from '@/services/ai/AiService'
import { AiService } from '@/services/ai/AiService'
import { SecurityPresets } from '@/utils/security/api-middleware'
import type { NextResponse } from 'next/server'

// GET /api/ai/[...slug] - Dynamic AI routes
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ai',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'context':
        return getContextHandler(context)
      case 'suggestions':
        return getSuggestionsHandler(context)
      default:
        return handleAPIError(new Error('Invalid AI route'), 'API Route')
    }
  }
)

// POST /api/ai/[...slug] - Dynamic AI routes
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ai',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'chat':
        return chatHandler(context)
      case 'generate-recipe':
        return generateRecipeHandler(context)
      default:
        return handleAPIError(new Error('Invalid AI route'), 'API Route')
    }
  }
)

// DELETE /api/ai/[...slug] - Delete context
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ai',
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context) => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 1 && slug[0] === 'context') {
      return deleteContextHandler(context)
    }

    return handleAPIError(new Error('Invalid path'), 'API Route')
  }
)

// Chat handler
async function chatHandler(context: RouteContext): Promise<NextResponse> {
  const { user } = context

  try {
    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
    const body = await context.request.json() as ChatRequest
    const result = await aiService.chat(body)

    return createSuccessResponse(result)
  } catch (error) {
    return handleAPIError(error, 'POST /api/ai/chat')
  }
}

// Get context handler
async function getContextHandler(context: RouteContext): Promise<NextResponse> {
  const { user, request } = context

  try {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')

    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
    const result = await aiService.getContext(page ?? undefined)

    return createSuccessResponse(result)
  } catch (error) {
    return handleAPIError(error, 'GET /api/ai/context')
  }
}

// Delete context handler
async function deleteContextHandler(context: RouteContext): Promise<NextResponse> {
  const { user } = context

  try {
    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
    await aiService.deleteContext()

    return createSuccessResponse({ message: 'Context deleted successfully' })
  } catch (error) {
    return handleAPIError(error, 'DELETE /api/ai/context')
  }
}

// Generate recipe handler
async function generateRecipeHandler(context: RouteContext): Promise<NextResponse> {
  const { user } = context

  try {
    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
    const body = await context.request.json() as RecipeGenerationRequest
    const result = await aiService.generateRecipe(body)

    return createSuccessResponse(result)
  } catch (error) {
    return handleAPIError(error, 'POST /api/ai/generate-recipe')
  }
}

// Get suggestions handler
async function getSuggestionsHandler(context: RouteContext): Promise<NextResponse> {
  const { user } = context

  try {
    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
    const result = await aiService.getSuggestions()

    return createSuccessResponse(result)
  } catch (error) {
    return handleAPIError(error, 'GET /api/ai/suggestions')
  }
}