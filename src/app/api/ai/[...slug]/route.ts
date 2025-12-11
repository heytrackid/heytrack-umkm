// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import type { ChatRequest, RecipeGenerationRequest } from '@/services/ai'
import { AiService } from '@/services/ai'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Enhanced validation schema for recipe generation
const RecipeGenerationSchema = z.object({
  productName: z.string()
    .min(3, 'Nama produk minimal 3 karakter')
    .max(100, 'Nama produk maksimal 100 karakter')
    .regex(/^[a-zA-Z0-9\s\u00C0-\u017F]+$/, 'Nama produk hanya boleh mengandung huruf, angka, dan spasi'),
  productType: z.string()
    .min(3, 'Tipe produk minimal 3 karakter')
    .max(50, 'Tipe produk maksimal 50 karakter'),
  servings: z.number()
    .int('Jumlah porsi harus bilangan bulat')
    .min(1, 'Jumlah porsi minimal 1')
    .max(100, 'Jumlah porsi maksimal 100'),
  preferredIngredients: z.array(z.string().max(50, 'Nama bahan maksimal 50 karakter'))
    .optional()
    .default([]),
  dietaryRestrictions: z.array(z.string().max(30, 'Restriksi diet maksimal 30 karakter'))
    .optional()
    .default([]),
  budget: z.number()
    .positive('Budget harus positif')
    .max(1000000, 'Budget maksimal Rp 1.000.000')
    .optional(),
  complexity: z.enum(['simple', 'medium', 'complex'])
    .optional(),
  specialInstructions: z.string()
    .min(10, 'Instruksi khusus minimal 10 karakter')
    .max(500, 'Instruksi khusus maksimal 500 karakter')
    .refine((val) => {
      // Check for potentially harmful content
      const harmfulPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
      ]
      return !harmfulPatterns.some(pattern => pattern.test(val))
    }, 'Instruksi mengandung konten yang tidak diizinkan')
    .optional()
})

// In-memory rate limiting for recipe generation (5 requests per minute per user)
const recipeRateLimitMap = new Map<string, { tokens: number; lastRefill: number }>()

function checkRateLimit(userId: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const userLimit = recipeRateLimitMap.get(userId)
  
  // Cleanup old entries periodically (1% chance)
  if (Math.random() < 0.01) {
    const cutoff = now - windowMs * 2
    for (const [id, data] of recipeRateLimitMap.entries()) {
      if (data.lastRefill < cutoff) {
        recipeRateLimitMap.delete(id)
      }
    }
  }
  
  if (!userLimit) {
    recipeRateLimitMap.set(userId, { tokens: limit - 1, lastRefill: now })
    return true
  }
  
  // Refill tokens based on time elapsed
  const timeSinceLastRefill = now - userLimit.lastRefill
  const tokensToAdd = Math.floor(timeSinceLastRefill / (windowMs / limit))
  
  if (tokensToAdd > 0) {
    userLimit.tokens = Math.min(limit, userLimit.tokens + tokensToAdd)
    userLimit.lastRefill = now
  }
  
  if (userLimit.tokens <= 0) {
    return false
  }
  
  userLimit.tokens -= 1
  return true
}

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
  async (context, _query, body) => {
    const { params } = context
    const slug = params?.['slug'] as string[] | undefined

    if (!slug || slug.length === 0) {
      return handleAPIError(new Error('Invalid path'), 'API Route')
    }

    const subRoute = slug[0]

    switch (subRoute) {
      case 'chat':
        return chatHandler(context, body as ChatRequest)
      case 'generate-recipe':
        return generateRecipeHandler(context, body as RecipeGenerationRequest)
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
async function chatHandler(context: RouteContext, body: ChatRequest): Promise<NextResponse> {
  const { user } = context

  try {
    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
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

// Generate recipe handler with enhanced security
async function generateRecipeHandler(context: RouteContext, body: RecipeGenerationRequest): Promise<NextResponse> {
  const { user } = context

  try {
    // Rate limiting check (5 requests per minute per user)
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi dalam 1 menit.' },
        { status: 429 }
      )
    }

    // Enhanced server-side validation
    const validationResult = RecipeGenerationSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join(', ')
      return NextResponse.json(
        { error: `Validasi gagal: ${errorMessages}` },
        { status: 400 }
      )
    }

    // Sanitize special instructions to prevent XSS
    const sanitizedInstructions = validationResult.data.specialInstructions 
      ? validationResult.data.specialInstructions
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim()
      : undefined

    const sanitizedBody = {
      productName: validationResult.data.productName,
      productType: validationResult.data.productType,
      servings: validationResult.data.servings,
      preferredIngredients: validationResult.data.preferredIngredients,
      dietaryRestrictions: validationResult.data.dietaryRestrictions,
      // Only include specialInstructions if it's defined to satisfy exactOptionalPropertyTypes
      ...(sanitizedInstructions && { specialInstructions: sanitizedInstructions }),
      // Only include budget if it's defined to satisfy exactOptionalPropertyTypes
      ...(validationResult.data.budget !== undefined && { budget: validationResult.data.budget }),
      ...(validationResult.data.complexity && { complexity: validationResult.data.complexity })
    } as RecipeGenerationRequest

    const aiService = new AiService({ userId: user.id, supabase: context.supabase })
    const result = await aiService.generateRecipe(sanitizedBody)

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