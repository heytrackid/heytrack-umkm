import { createApiRoute } from '@/lib/api/route-factory'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  recipeId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  servings: z.number().min(1).default(4),
  prepTimeMinutes: z.number().optional().nullable(),
  cookTimeMinutes: z.number().optional().nullable(),
  totalTimeMinutes: z.number().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  cookingMethod: z.string().optional().nullable(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
    notes: z.string().optional().nullable(),
    actualCost: z.number().optional().nullable(),
    costPerServing: z.number().optional().nullable(),
    substitutions: z.array(z.any()).optional().nullable(),
    hasSubstitutions: z.boolean().optional().nullable(),
    potentialSavings: z.number().optional().nullable()
  })).default([]),
  instructions: z.array(z.string()).default([]),
  nutritionInfo: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number()
  }).optional().nullable(),
  totalCost: z.number().optional().nullable(),
  costPerServing: z.number().optional().nullable()
})

export const runtime = 'nodejs'

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/chef-wise/save',
    bodySchema,
    requireAuth: true,
  },
  async (context, _query, validatedBody) => {
    const body = validatedBody as z.infer<typeof bodySchema>
    const {
      recipeId,
      name,
      description,
      category,
      servings,
      prepTimeMinutes,
      cookTimeMinutes,
      difficulty,
      ingredients,
      instructions
    } = body

    try {
      // Check if recipe already exists
      if (recipeId) {
        // Update recipe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
          name,
          description: description || null,
          category: category || null,
          servings,
          prep_time: prepTimeMinutes || null,
          cook_time: cookTimeMinutes || null,
          instructions: instructions.join('\n'), // Convert array to string
          difficulty: difficulty || null,
          updated_at: new Date().toISOString()
        }
        
        const { error: updateError } = await context.supabase
          .from('recipes')
          .update(updateData)
          .eq('id', recipeId)
          .eq('user_id', context.user.id)

        if (updateError) {
          // Error logging
          // eslint-disable-next-line no-console
          console.error('Error updating recipe:', updateError)
          return NextResponse.json({
            success: false,
            error: 'Gagal update resep'
          }, { status: 500 })
        }

        // Update ingredients
        await context.supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId)

        const ingredientsToInsert = ingredients.map((ing: z.infer<typeof bodySchema>['ingredients'][0]) => ({
          ingredient_id: ing.name, // Using name as ingredient_id for now
          recipe_id: recipeId,
          quantity: ing.quantity,
          unit: ing.unit,
          user_id: context.user.id
        }))

        const { error: ingredientsError } = await context.supabase
          .from('recipe_ingredients')
          .insert(ingredientsToInsert)

        if (ingredientsError) {
          // Error logging
          // eslint-disable-next-line no-console
          console.error('Error updating ingredients:', ingredientsError)
        }

        return NextResponse.json({
          success: true,
          data: { recipeId }
        })
      } else {
        // Create new recipe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const insertData: any = {
          name,
          description: description || null,
          category: category || null,
          servings,
          prep_time: prepTimeMinutes || null,
          cook_time: cookTimeMinutes || null,
          instructions: instructions.join('\n'), // Convert array to string
          difficulty: difficulty || null,
          user_id: context.user.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data: newRecipe, error: createError } = await context.supabase
          .from('recipes')
          .insert(insertData)
          .select('id')
          .single()

        if (createError || !newRecipe) {
          // Error logging
          // eslint-disable-next-line no-console
          console.error('Error creating recipe:', createError)
          return NextResponse.json({
            success: false,
            error: 'Gagal membuat resep'
          }, { status: 500 })
        }

        // Insert ingredients
        const ingredientsToInsert = ingredients.map((ing: z.infer<typeof bodySchema>['ingredients'][0]) => ({
          ingredient_id: ing.name, // Using name as ingredient_id for now
          recipe_id: newRecipe.id,
          quantity: ing.quantity,
          unit: ing.unit,
          user_id: context.user.id
        }))

        const { error: ingredientsError } = await context.supabase
          .from('recipe_ingredients')
          .insert(ingredientsToInsert)

        if (ingredientsError) {
          // Error logging
          // eslint-disable-next-line no-console
          console.error('Error inserting ingredients:', ingredientsError)
        }

        // Save to chefwise_generations for tracking
        await context.supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from('chefwise_generations' as any)
          .insert({
            user_id: context.user.id,
            recipe_id: newRecipe.id,
            request: JSON.stringify({}),
            recipe: JSON.stringify(body),
            saved_to_recipes: true,
            created_at: new Date().toISOString()
          })

        return NextResponse.json({
          success: true,
          data: { recipeId: newRecipe.id }
        })
      }
    } catch (error) {
      // Error logging
      // eslint-disable-next-line no-console
      console.error('Error saving recipe:', error)
      return NextResponse.json({
        success: false,
        error: 'Gagal menyimpan resep'
      }, { status: 500 })
    }
  }
)
