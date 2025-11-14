export const runtime = 'nodejs'
export const maxDuration = 60

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { AIRecipeGenerationSchema } from '@/lib/validations/api-schemas'
import { validateRequestOrRespond } from '@/lib/validations/validate-request'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

import { MAX_RETRIES } from './constants'
import { callAIServiceWithRetry } from './services/ai-service'
import { generateFallbackRecipe } from './services/fallback-recipes'
import { calculateRecipeHPP } from './services/hpp-calculator'
import { buildRecipePrompt } from './services/prompt-builder'
import { parseRecipeResponse, validateRecipeQuality } from './services/recipe-parser'
import { fetchUserIngredients, handleDuplicateRecipeName } from './utils/data-fetcher'

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const userId = authResult.id

    const validatedData = await validateRequestOrRespond(request, AIRecipeGenerationSchema)
    if (validatedData instanceof NextResponse) {
      return validatedData
    }

    const {
      name: productName,
      type: productType,
      servings,
      targetPrice,
      dietaryRestrictions = [],
      preferredIngredients: availableIngredients = [],
    } = validatedData

    const supabase = await createClient()
    const typedIngredients = await fetchUserIngredients(supabase, userId)

    const prompt = buildRecipePrompt({
      productName,
      productType,
      servings,
      ...(targetPrice !== undefined && { targetPrice }),
      dietaryRestrictions,
      availableIngredients: typedIngredients,
      userProvidedIngredients: availableIngredients
    })

    const aiResponse = await callAIServiceWithRetry(prompt, MAX_RETRIES)
    const recipe = parseRecipeResponse(aiResponse)

    let finalRecipe = recipe
    try {
      validateRecipeQuality(recipe, typedIngredients)
    } catch (validationError) {
      apiLogger.warn({ validationError }, 'Recipe validation failed, attempting fallback')
      const fallbackRecipe = generateFallbackRecipe(productName, productType, servings, typedIngredients)
      if (fallbackRecipe) {
        finalRecipe = fallbackRecipe
      } else {
        throw validationError
      }
    }

    finalRecipe = await handleDuplicateRecipeName(supabase, finalRecipe, userId)
    const hppCalculation = await calculateRecipeHPP(finalRecipe, typedIngredients, userId)

    return NextResponse.json({
      success: true,
      recipe: {
        ...finalRecipe,
        hpp: {
          totalMaterialCost: hppCalculation.totalMaterialCost,
          estimatedOperationalCost: hppCalculation.operationalCost,
          totalHPP: hppCalculation.totalHPP,
          hppPerUnit: hppCalculation.hppPerUnit,
          suggestedSellingPrice: hppCalculation.suggestedSellingPrice,
          estimatedMargin: hppCalculation.estimatedMargin,
        }
      }
    })
  } catch (error) {
    apiLogger.error({ error }, 'Error generating recipe')
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate recipe'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/ai/generate-recipe', SecurityPresets.enhanced())
