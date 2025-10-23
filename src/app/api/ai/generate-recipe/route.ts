import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 60

/**
 * AI Recipe Generator API
 * Generates bakery recipes with accurate ingredient measurements and HPP calculations
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            productName,
            productType,
            servings,
            targetPrice,
            dietaryRestrictions,
            availableIngredients,
            userId
        } = body

        // Validate required fields
        if (!productName || !productType || !servings || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get user's available ingredients from database
        const supabase = createSupabaseClient()
        const { data: ingredients, error: ingredientsError } = await supabase
            .from('ingredients')
            .select('*')
            .eq('user_id', userId)

        if (ingredientsError) {
            console.error('Error fetching ingredients:', ingredientsError)
        }

        // Build the AI prompt
        const prompt = buildRecipePrompt({
            productName,
            productType,
            servings,
            targetPrice,
            dietaryRestrictions,
            availableIngredients: ingredients || [],
            userProvidedIngredients: availableIngredients
        })

        // Call OpenAI API (or your preferred AI service)
        const aiResponse = await callAIService(prompt)

        // Parse and validate the response
        const recipe = parseRecipeResponse(aiResponse)

        // Calculate HPP for the generated recipe
        const hppCalculation = await calculateRecipeHPP(recipe, ingredients || [])

        return NextResponse.json({
            success: true,
            recipe: {
                ...recipe,
                hpp: hppCalculation
            }
        })

    } catch (error: any) {
        console.error('Error generating recipe:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate recipe' },
            { status: 500 }
        )
    }
}


/**
 * Build comprehensive AI prompt for recipe generation
 */
function buildRecipePrompt(params: {
    productName: string
    productType: string
    servings: number
    targetPrice?: number
    dietaryRestrictions?: string[]
    availableIngredients: any[]
    userProvidedIngredients?: string[]
}) {
    const {
        productName,
        productType,
        servings,
        targetPrice,
        dietaryRestrictions,
        availableIngredients,
        userProvidedIngredients
    } = params

    // Format available ingredients with prices
    const ingredientsList = availableIngredients
        .map(ing => `- ${ing.name}: Rp ${ing.price_per_unit.toLocaleString('id-ID')}/${ing.unit}`)
        .join('\n')

    const prompt = `You are an expert bakery chef and recipe developer specializing in Indonesian bakery products (UMKM). 
Your task is to create a detailed, professional bakery recipe with accurate measurements and cost calculations.

## PRODUCT SPECIFICATIONS:
- Product Name: ${productName}
- Product Type: ${productType}
- Yield/Servings: ${servings} ${productType === 'cake' || productType === 'bread' ? 'loaves/pieces' : 'units'}
${targetPrice ? `- Target Selling Price: Rp ${targetPrice.toLocaleString('id-ID')}` : ''}
${dietaryRestrictions?.length ? `- Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}

## AVAILABLE INGREDIENTS IN USER'S INVENTORY:
${ingredientsList || 'No ingredients data available'}

${userProvidedIngredients?.length ? `\n## USER PREFERRED INGREDIENTS:\n${userProvidedIngredients.join(', ')}` : ''}

## YOUR TASK:
Create a professional bakery recipe following these STRICT REQUIREMENTS:

### 1. RECIPE STRUCTURE:
You must return a JSON object with this EXACT structure:


{
  "name": "Product Name",
  "category": "bread|cake|pastry|cookies|donuts|other",
  "servings": number,
  "prep_time_minutes": number,
  "bake_time_minutes": number,
  "total_time_minutes": number,
  "difficulty": "easy|medium|hard",
  "description": "Brief description of the product",
  "ingredients": [
    {
      "name": "Ingredient Name (must match available ingredients)",
      "quantity": number (in grams, ml, or pieces),
      "unit": "gram|ml|piece|kg|liter",
      "notes": "Optional preparation notes"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed instruction",
      "duration_minutes": number,
      "temperature": "Optional: 180°C, etc"
    }
  ],
  "tips": [
    "Professional tip 1",
    "Professional tip 2"
  ],
  "storage": "Storage instructions",
  "shelf_life": "Shelf life information"
}

### 2. INGREDIENT REQUIREMENTS:
- Use ONLY ingredients from the available inventory list above
- If an ingredient is not available, suggest the closest alternative
- Quantities must be REALISTIC and ACCURATE for bakery production
- Use metric measurements (grams, ml, kg, liters)
- For small quantities, use grams (e.g., 5g salt, not 0.005kg)
- Include ALL necessary ingredients (don't skip basics like salt, baking powder)

### 3. MEASUREMENT ACCURACY:
- Flour: typically 250-500g per loaf of bread
- Sugar: 10-20% of flour weight for sweet breads
- Salt: 1-2% of flour weight
- Yeast: 1-2% of flour weight for bread
- Eggs: count in pieces, but note weight (1 egg ≈ 50-60g)
- Butter/Margarin: 10-30% of flour weight
- Liquid (milk/water): 60-70% of flour weight for bread

### 4. INSTRUCTIONS QUALITY:
- Provide step-by-step instructions that a beginner can follow
- Include specific temperatures for baking
- Include timing for each major step
- Mention visual cues (golden brown, doubled in size, etc)
- Include mixing techniques (fold, whisk, knead, etc)

### 5. PROFESSIONAL TIPS:
- Include at least 3 professional tips
- Tips should be actionable and specific
- Cover common mistakes to avoid
- Suggest variations or customizations

### 6. COST OPTIMIZATION:
${targetPrice ? `- The recipe should aim for a production cost of 40-50% of the target price (Rp ${(targetPrice * 0.4).toLocaleString('id-ID')} - Rp ${(targetPrice * 0.5).toLocaleString('id-ID')})` : ''}
- Prioritize cost-effective ingredients without compromising quality
- Suggest premium alternatives if applicable

### 7. INDONESIAN CONTEXT:
- Consider Indonesian taste preferences (often sweeter)
- Use locally available ingredients
- Consider tropical climate (affects rising time, storage)
- Provide storage tips for humid weather

### 8. DIETARY RESTRICTIONS:
${dietaryRestrictions?.length ? `- MUST comply with: ${dietaryRestrictions.join(', ')}` : '- No specific restrictions'}

## IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown formatting, no code blocks
2. All ingredient names must EXACTLY match the available ingredients list
3. Quantities must be realistic for ${servings} servings
4. Include preparation AND baking time
5. Be specific with temperatures and timing
6. Consider the product type (${productType}) characteristics

Generate the recipe now:`

    return prompt
}


/**
 * Call AI service (OpenAI, Anthropic, or other)
 */
async function callAIService(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
        throw new Error('AI API key not configured')
    }

    // Using OpenAI as example
    if (process.env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert bakery chef specializing in Indonesian UMKM bakery products. You create detailed, accurate recipes with precise measurements and professional techniques.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        return data.choices[0].message.content
    }

    // Using Anthropic Claude as alternative
    if (process.env.ANTHROPIC_API_KEY) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        return data.content[0].text
    }

    throw new Error('No AI service configured')
}


/**
 * Parse and validate AI response
 */
function parseRecipeResponse(response: string) {
    try {
        // Remove markdown code blocks if present
        let cleanResponse = response.trim()
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/```\n?/g, '')
        }

        const recipe = JSON.parse(cleanResponse)

        // Validate required fields
        if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
            throw new Error('Invalid recipe structure: missing required fields')
        }

        // Validate ingredients array
        if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
            throw new Error('Recipe must have at least one ingredient')
        }

        // Validate each ingredient
        recipe.ingredients.forEach((ing: any, index: number) => {
            if (!ing.name || !ing.quantity || !ing.unit) {
                throw new Error(`Invalid ingredient at index ${index}: missing required fields`)
            }
            if (typeof ing.quantity !== 'number' || ing.quantity <= 0) {
                throw new Error(`Invalid ingredient quantity at index ${index}`)
            }
        })

        // Validate instructions array
        if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
            throw new Error('Recipe must have at least one instruction step')
        }

        return recipe
    } catch (error: any) {
        console.error('Error parsing recipe response:', error)
        throw new Error(`Failed to parse recipe: ${error.message}`)
    }
}


/**
 * Calculate HPP for the generated recipe
 */
async function calculateRecipeHPP(recipe: any, availableIngredients: any[]) {
    let totalMaterialCost = 0
    const ingredientBreakdown: any[] = []

    for (const recipeIng of recipe.ingredients) {
        // Find matching ingredient in user's inventory
        const ingredient = availableIngredients.find(
            ing => ing.name.toLowerCase() === recipeIng.name.toLowerCase()
        )

        if (!ingredient) {
            console.warn(`Ingredient not found in inventory: ${recipeIng.name}`)
            continue
        }

        // Convert quantity to base unit if needed
        let quantityInBaseUnit = recipeIng.quantity
        if (recipeIng.unit === 'kg' && ingredient.unit === 'gram') {
            quantityInBaseUnit = recipeIng.quantity * 1000
        } else if (recipeIng.unit === 'liter' && ingredient.unit === 'ml') {
            quantityInBaseUnit = recipeIng.quantity * 1000
        } else if (recipeIng.unit === 'gram' && ingredient.unit === 'kg') {
            quantityInBaseUnit = recipeIng.quantity / 1000
        } else if (recipeIng.unit === 'ml' && ingredient.unit === 'liter') {
            quantityInBaseUnit = recipeIng.quantity / 1000
        }

        // Calculate cost
        const cost = quantityInBaseUnit * ingredient.price_per_unit
        totalMaterialCost += cost

        ingredientBreakdown.push({
            name: ingredient.name,
            quantity: recipeIng.quantity,
            unit: recipeIng.unit,
            pricePerUnit: ingredient.price_per_unit,
            totalCost: cost,
            percentage: 0 // Will be calculated after total
        })
    }

    // Calculate percentages
    ingredientBreakdown.forEach(item => {
        item.percentage = totalMaterialCost > 0 ? (item.totalCost / totalMaterialCost) * 100 : 0
    })

    // Estimate operational cost (simplified - can be enhanced)
    const estimatedOperationalCost = totalMaterialCost * 0.3 // 30% of material cost

    const totalHPP = totalMaterialCost + estimatedOperationalCost
    const hppPerUnit = totalHPP / recipe.servings

    return {
        totalMaterialCost,
        estimatedOperationalCost,
        totalHPP,
        hppPerUnit,
        servings: recipe.servings,
        ingredientBreakdown,
        suggestedSellingPrice: hppPerUnit * 2.5, // 2.5x markup for healthy margin
        estimatedMargin: 60 // 60% margin
    }
}
