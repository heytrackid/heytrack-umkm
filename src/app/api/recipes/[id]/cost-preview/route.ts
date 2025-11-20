import { NextResponse } from 'next/server'

import { createApiRoute } from '@/lib/api/route-factory'
import { buildRecipeCostPreview } from '@/lib/costs/cost-calculations'
import { apiLogger } from '@/lib/logger'
import { isRecipeCostRecord } from '@/types/recipes/cost'
import type { RecipeCostRecord } from '@/types/recipes/cost'

/**
 * GET /api/recipes/[id]/cost-preview
 * Get simplified cost preview for a single recipe
 */
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes/[id]/cost-preview',
    requireAuth: true,
  },
  async ({ supabase, params }) => {
    const recipeId = params?.['id']
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 })
    }

    try {
      const { data, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          servings,
          updated_at,
          recipe_ingredients (
            quantity,
            ingredients:ingredient_id (
              id,
              name,
              price_per_unit,
              weighted_average_cost,
              unit,
              updated_at
            )
          )
        `)
        .eq('id', recipeId)
        .single()

      if (recipeError || !data) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }

      const recipe = data as RecipeCostRecord

      if (!isRecipeCostRecord(recipe)) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
      const preview = buildRecipeCostPreview(recipe)

      return NextResponse.json(preview)
    } catch (error) {
      apiLogger.error({ error, recipeId }, 'Failed to build recipe cost preview')
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
)