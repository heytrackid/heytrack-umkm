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

// Flexible validation schema for recipe generation - allows free-form input
const RecipeGenerationSchema = z.object({
  // Product name - very flexible, just needs some text
  productName: z.string()
    .min(1, 'Nama produk tidak boleh kosong')
    .max(200, 'Nama produk terlalu panjang')
    .transform(val => val.trim()),
  
  // Product type - optional with default
  productType: z.string()
    .max(100, 'Tipe produk terlalu panjang')
    .optional()
    .default('main-dish'),
  
  // Servings - flexible, defaults to 1 if not provided or invalid
  servings: z.union([
    z.number().int().min(1).max(1000),
    z.string().transform(val => {
      const num = parseInt(val, 10)
      return Number.isNaN(num) || num < 1 ? 1 : Math.min(num, 1000)
    })
  ]).optional().default(1),
  
  // Ingredients - optional arrays
  preferredIngredients: z.array(z.string().max(100))
    .optional()
    .default([]),
  customIngredients: z.array(z.string().max(100))
    .optional()
    .default([]),
  dietaryRestrictions: z.array(z.string().max(50))
    .optional()
    .default([]),
  
  // Budget - optional, accepts 0 or positive numbers, null, undefined
  budget: z.union([
    z.number().min(0).max(100000000),
    z.string().transform(val => {
      const num = parseFloat(val.replace(/[^\d.]/g, ''))
      return Number.isNaN(num) ? undefined : num
    }),
    z.null(),
    z.undefined()
  ]).optional(),
  
  // Target price - optional alias for budget
  targetPrice: z.union([
    z.number().min(0).max(100000000),
    z.string().transform(val => {
      const num = parseFloat(val.replace(/[^\d.]/g, ''))
      return Number.isNaN(num) ? undefined : num
    }),
    z.null(),
    z.undefined()
  ]).optional(),
  
  // Complexity - optional
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  
  // Special instructions - very flexible, just sanitize harmful content
  specialInstructions: z.string()
    .max(2000, 'Instruksi terlalu panjang')
    .transform(val => {
      // Remove potentially harmful content
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
    })
    .optional()
}).passthrough() // Allow additional fields to pass through

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

// Generate recipe handler with flexible validation
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

    // Flexible server-side validation - be lenient with user input
    const validationResult = RecipeGenerationSchema.safeParse(body)
    if (!validationResult.success) {
      // Validation warnings - proceed with defaults for non-critical issues
      
      // Only fail on critical errors (empty product name)
      const criticalErrors = validationResult.error.issues.filter(
        issue => issue.path.includes('productName') && issue.code === 'too_small'
      )
      
      if (criticalErrors.length > 0) {
        return NextResponse.json(
          { error: 'Mohon masukkan nama atau deskripsi resep yang ingin dibuat' },
          { status: 400 }
        )
      }
    }

    // Build sanitized body with flexible defaults
    const data = validationResult.success ? validationResult.data : body
    const dataRecord = data as Record<string, unknown>
    
    // Extract customIngredients and targetPrice safely
    const customIngredientsRaw = dataRecord['customIngredients']
    const targetPriceRaw = dataRecord['targetPrice']
    
    const sanitizedBody = {
      productName: String(data.productName || 'Resep Baru').trim().slice(0, 200),
      productType: String(data.productType || 'main-dish').slice(0, 100),
      servings: typeof data.servings === 'number' && data.servings > 0 
        ? Math.min(data.servings, 1000) 
        : 1,
      preferredIngredients: Array.isArray(data.preferredIngredients) 
        ? data.preferredIngredients.filter(Boolean).slice(0, 20) 
        : [],
      customIngredients: Array.isArray(customIngredientsRaw) 
        ? (customIngredientsRaw as string[]).filter(Boolean).slice(0, 20) 
        : [],
      dietaryRestrictions: Array.isArray(data.dietaryRestrictions) 
        ? data.dietaryRestrictions.filter(Boolean).slice(0, 10) 
        : [],
      // Include budget/targetPrice only if valid positive number
      ...(typeof data.budget === 'number' && data.budget > 0 && { budget: data.budget }),
      ...(typeof targetPriceRaw === 'number' && targetPriceRaw > 0 && { targetPrice: targetPriceRaw }),
      // Include special instructions if provided (already sanitized by schema)
      ...(data.specialInstructions && { specialInstructions: String(data.specialInstructions).slice(0, 2000) }),
      ...(data.complexity && { complexity: data.complexity })
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