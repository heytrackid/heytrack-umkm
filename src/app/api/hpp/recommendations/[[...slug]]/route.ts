export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { cacheInvalidation } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'

import { PaginationQuerySchema } from '@/lib/validations'
import { hppRecommendationUpdateSchema } from '@/lib/validations/domains/hpp'
import { InputSanitizer } from '@/utils/security/index'

import { createSuccessResponse } from '@/lib/api-core'

const CreateHppRecommendationSchema = z.object({
  recipeId: z.string().uuid('Recipe ID harus valid'),
  recommendationType: z.string().min(1, 'Tipe rekomendasi wajib diisi').max(50),
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(1000),
  potentialSavings: z.number().min(0, 'Potensi penghematan harus >= 0').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
}).strict()

// GET /api/hpp/recommendations or /api/hpp/recommendations/[id]
async function getHandler(context: RouteContext): Promise<NextResponse> {
  const { request, params } = context
  const slug = params?.['slug']

  if (!slug || slug.length === 0) {
    // GET /api/hpp/recommendations - List recommendations
    try {
      const { user, supabase } = context

      const { searchParams } = new URL(request.url)

      const queryValidation = PaginationQuerySchema.safeParse({
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        search: searchParams.get('search'),
        sort_by: searchParams.get('sort_by'),
        sort_order: searchParams.get('sort_order'),
      })

      if (!queryValidation.success) {
        return handleAPIError(new Error('Invalid query parameters'), 'GET /api/hpp/recommendations')
      }

      const { page, limit, search, sort_by, sort_order } = queryValidation.data

      // Build query with filters
      let query = supabase
        .from('hpp_recommendations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (sort_by && sort_order) {
        query = query.order(sort_by, { ascending: sort_order === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return createSuccessResponse({
        data: data || [],
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    } catch (error) {
      apiLogger.error({ error }, 'Error fetching HPP recommendations')
      return handleAPIError(new Error('Internal server error'), 'API Route')
    }
  } else {
    return handleAPIError(new Error('Invalid path'), 'API Route')
  }
}

// POST /api/hpp/recommendations - Create recommendation
async function postHandler(context: RouteContext, _query?: never, body?: z.infer<typeof CreateHppRecommendationSchema>): Promise<NextResponse> {
  const { user, supabase } = context

  try {
    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const validatedData = body

    const sanitizedData = {
      ...validatedData,
      title: InputSanitizer.sanitizeHtml(validatedData.title),
      description: InputSanitizer.sanitizeHtml(validatedData.description),
      recommendationType: InputSanitizer.sanitizeSQLInput(validatedData.recommendationType),
    }

    const { recipeId, recommendationType, title, description, potentialSavings, priority } = sanitizedData

    const insertData = {
      recipe_id: recipeId,
      recommendation_type: recommendationType,
      title,
      description,
      potential_savings: potentialSavings ?? 0,
      priority: priority ?? 'MEDIUM',
      is_implemented: false,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('hpp_recommendations')
      .insert(insertData)
      .select('id, recipe_id, recommendation_type, title, description, potential_savings, priority, is_implemented, created_at, user_id')
      .single()

    if (error) {
      throw new Error(`Failed to create recommendation: ${error.message}`)
    }

    cacheInvalidation.hpp()

    apiLogger.info({
      userId: user.id,
      recommendationId: data.id,
      recipeId
    }, 'HPP recommendation created successfully')

    return createSuccessResponse({ recommendation: data })
  } catch (error) {
    apiLogger.error({ error }, 'Error creating HPP recommendation')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

// PATCH /api/hpp/recommendations/[id] - Update recommendation
async function patchHandler(context: RouteContext, _query?: never, body?: z.infer<typeof hppRecommendationUpdateSchema>): Promise<NextResponse> {
  const slug = context.params?.['slug']
  if (!slug || slug.length !== 1) {
    return handleAPIError(new Error('Invalid path'), 'API Route')
  }

  const id = slug[0]!
  const { user, supabase } = context

  try {
    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const validation = hppRecommendationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return handleAPIError(new Error('Invalid data'), 'PUT /api/hpp/recommendations')
    }

    const updateData = {
      ...(validation.data.title && { title: validation.data.title }),
      ...(validation.data.description && { description: validation.data.description }),
      ...(validation.data.potentialSavings !== undefined && { potential_savings: validation.data.potentialSavings }),
      ...(validation.data.priority && { priority: validation.data.priority }),
      ...(validation.data.isImplemented !== undefined && { is_implemented: validation.data.isImplemented }),
    }

    const { data, error } = await supabase
      .from('hpp_recommendations')
      .update(updateData as never)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return handleAPIError(new Error('Recommendation not found'), 'API Route')
      }
      throw error
    }

    return createSuccessResponse(data)
  } catch (error) {
    return handleAPIError(error, 'PATCH /api/hpp/recommendations/[id]')
  }
}

// DELETE /api/hpp/recommendations/[id] - Delete recommendation
async function deleteHandler(context: RouteContext): Promise<NextResponse> {
  const slug = context.params?.['slug']
  if (!slug || slug.length !== 1) {
    return handleAPIError(new Error('Invalid path'), 'API Route')
  }

  const id = slug[0]!

  try {
    const { user, supabase } = context

    const { error } = await supabase
      .from('hpp_recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return createSuccessResponse({ success: true })
  } catch (error) {
    return handleAPIError(error, 'DELETE /api/hpp/recommendations/[id]')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/hpp/recommendations',
    securityPreset: SecurityPresets.basic(),
  },
  getHandler
)

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/hpp/recommendations',
    securityPreset: SecurityPresets.basic(),
  },
  postHandler
)

export const PATCH = createApiRoute(
  {
    method: 'PATCH',
    path: '/api/hpp/recommendations/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  patchHandler
)

export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/hpp/recommendations/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  deleteHandler
)