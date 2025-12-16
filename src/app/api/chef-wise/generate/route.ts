import { createApiRoute } from '@/lib/api/route-factory'
import type { RecipeGenerationRequest } from '@/services/ai'
import { AiService } from '@/services/ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  productName: z.string().min(1, 'Nama produk harus diisi'),
  productType: z.string().min(1, 'Tipe produk harus diisi'),
  servings: z.number().min(1).max(20),
  preferredIngredients: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  budget: z.number().optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  specialInstructions: z.string().optional()
})

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/chef-wise/generate',
    bodySchema: requestSchema,
    requireAuth: true,
  },
  async (context, _query, validatedBody) => {
    // Add null check for validatedBody
    if (!validatedBody) {
      return NextResponse.json({
        success: false,
        error: 'Request body is missing or invalid'
      }, { status: 400 })
    }

    const aiService = new AiService({
      supabase: context.supabase,
      userId: context.user.id
    } as { supabase: typeof context.supabase; userId: typeof context.user.id })
    
    try {
      // Transform request to match AiService interface
      const body = validatedBody as z.infer<typeof requestSchema>
      
      // Add defensive checks
      if (!body.productName || !body.productType) {
        return NextResponse.json({
          success: false,
          error: 'Product name and type are required'
        }, { status: 400 })
      }

      const recipeRequest: RecipeGenerationRequest = {
        productName: body.productName,
        productType: body.productType,
        servings: body.servings || 4,
        preferredIngredients: body.preferredIngredients || [],
        dietaryRestrictions: body.dietaryRestrictions || []
      }

      // Only include optional properties if they're defined (for exactOptionalPropertyTypes)
      if (body.budget !== undefined) {
        recipeRequest.budget = body.budget
      }
      if (body.complexity !== undefined) {
        recipeRequest.complexity = body.complexity
      }
      if (body.specialInstructions !== undefined) {
        recipeRequest.specialInstructions = body.specialInstructions
      }

      const generatedRecipe = await aiService.generateRecipe(recipeRequest)

      return NextResponse.json({
        success: true,
        data: generatedRecipe
      })
    } catch (error) {
      // Error logging
      // eslint-disable-next-line no-console
      console.error('Recipe generation error:', error)
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Gagal generate resep'
      }, { status: 500 })
    }
  }
)
