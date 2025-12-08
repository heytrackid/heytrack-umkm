export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger } from '@/lib/logger'
import { PositiveNumberSchema } from '@/lib/validations/common'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { z } from 'zod'

const generateRecipeSchema = z.object({
  prompt: z.string().min(10, 'Prompt harus minimal 10 karakter'),
  servings: PositiveNumberSchema.min(1).max(100).optional(),
  cuisine: z.string().optional(),
  dietary: z.array(z.string()).optional(),
})

// Interface for user's ingredient from database
interface UserIngredient {
  id: string
  name: string
  price_per_unit: number
  unit: string
  weighted_average_cost: number
  category: string | null
}

// Interface for AI-generated ingredient
interface GeneratedIngredient {
  name: string
  quantity: number
  unit: string
  notes?: string
  estimated_cost?: number
  matched_ingredient_id?: string
  price_per_unit?: number
}

// Simple fuzzy matching for ingredient names
function findMatchingIngredient(
  searchName: string, 
  userIngredients: UserIngredient[]
): UserIngredient | null {
  const normalizedSearch = searchName.toLowerCase().trim()
  
  // Try exact match first
  let match = userIngredients.find(
    ing => ing.name.toLowerCase() === normalizedSearch
  )
  if (match) return match
  
  // Try contains match
  match = userIngredients.find(
    ing => ing.name.toLowerCase().includes(normalizedSearch) ||
           normalizedSearch.includes(ing.name.toLowerCase())
  )
  if (match) return match
  
  // Try word-based matching (at least one significant word matches)
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 2)
  for (const ing of userIngredients) {
    const ingWords = ing.name.toLowerCase().split(/\s+/)
    const hasMatch = searchWords.some(sw => 
      ingWords.some(iw => iw.includes(sw) || sw.includes(iw))
    )
    if (hasMatch) return ing
  }
  
  return null
}

// Convert quantity between different units
function convertQuantity(
  quantity: number, 
  fromUnit: string, 
  toUnit: string
): number {
  const normalizeUnit = (u: string) => u.toLowerCase().trim()
  const from = normalizeUnit(fromUnit)
  const to = normalizeUnit(toUnit)
  
  if (from === to) return quantity
  
  // Weight conversions
  const weightConversions: Record<string, number> = {
    'kg': 1000,
    'gram': 1,
    'g': 1,
    'gr': 1,
    'ons': 100,
    'mg': 0.001,
  }
  
  // Volume conversions (to ml)
  const volumeConversions: Record<string, number> = {
    'liter': 1000,
    'l': 1000,
    'ml': 1,
    'cc': 1,
    'sdm': 15,  // sendok makan
    'sdt': 5,   // sendok teh
  }
  
  // Try weight conversion
  const fromWeight = weightConversions[from]
  const toWeight = weightConversions[to]
  if (fromWeight !== undefined && toWeight !== undefined) {
    const baseGrams = quantity * fromWeight
    return baseGrams / toWeight
  }
  
  // Try volume conversion
  const fromVolume = volumeConversions[from]
  const toVolume = volumeConversions[to]
  if (fromVolume !== undefined && toVolume !== undefined) {
    const baseMl = quantity * fromVolume
    return baseMl / toVolume
  }
  
  // No conversion possible, return original
  return quantity
}

// Calculate cost for an ingredient
function calculateIngredientCost(
  ingredient: GeneratedIngredient,
  userIngredient: UserIngredient | null
): number {
  if (!userIngredient) {
    // Use a reasonable default estimate based on category/type
    // These are approximate Indonesian market prices
    return estimateDefaultCost(ingredient)
  }
  
  // Use weighted average cost if available, otherwise price_per_unit
  const pricePerUnit = userIngredient.weighted_average_cost || userIngredient.price_per_unit
  
  // Convert quantity to match user's unit
  const convertedQty = convertQuantity(
    ingredient.quantity,
    ingredient.unit,
    userIngredient.unit
  )
  
  return Math.round(convertedQty * pricePerUnit)
}

// Estimate default cost when ingredient not in database
function estimateDefaultCost(ingredient: GeneratedIngredient): number {
  const name = ingredient.name.toLowerCase()
  const qty = ingredient.quantity
  const unit = ingredient.unit.toLowerCase()
  
  // Convert to base unit for estimation
  let baseQty = qty
  if (unit === 'kg') baseQty = qty * 1000
  else if (unit === 'liter' || unit === 'l') baseQty = qty * 1000
  
  // Estimate based on ingredient type (prices in Rupiah per gram/ml)
  // These are realistic Indonesian market prices
  if (name.includes('ayam') || name.includes('chicken')) {
    return Math.round(baseQty * 45) // ~Rp 45.000/kg
  } else if (name.includes('daging') || name.includes('beef') || name.includes('sapi')) {
    return Math.round(baseQty * 120) // ~Rp 120.000/kg
  } else if (name.includes('ikan') || name.includes('fish')) {
    return Math.round(baseQty * 50) // ~Rp 50.000/kg
  } else if (name.includes('udang') || name.includes('shrimp')) {
    return Math.round(baseQty * 80) // ~Rp 80.000/kg
  } else if (name.includes('telur') || name.includes('egg')) {
    return Math.round(qty * 2500) // ~Rp 2.500/butir
  } else if (name.includes('beras') || name.includes('rice') || name.includes('nasi')) {
    return Math.round(baseQty * 15) // ~Rp 15.000/kg
  } else if (name.includes('tepung') || name.includes('flour')) {
    return Math.round(baseQty * 12) // ~Rp 12.000/kg
  } else if (name.includes('gula') || name.includes('sugar')) {
    return Math.round(baseQty * 16) // ~Rp 16.000/kg
  } else if (name.includes('minyak') || name.includes('oil')) {
    return Math.round(baseQty * 18) // ~Rp 18.000/liter
  } else if (name.includes('susu') || name.includes('milk')) {
    return Math.round(baseQty * 20) // ~Rp 20.000/liter
  } else if (name.includes('keju') || name.includes('cheese')) {
    return Math.round(baseQty * 100) // ~Rp 100.000/kg
  } else if (name.includes('mentega') || name.includes('butter')) {
    return Math.round(baseQty * 60) // ~Rp 60.000/kg
  } else if (name.includes('bawang') || name.includes('onion') || name.includes('garlic')) {
    return Math.round(baseQty * 35) // ~Rp 35.000/kg
  } else if (name.includes('cabai') || name.includes('chili')) {
    return Math.round(baseQty * 40) // ~Rp 40.000/kg
  } else if (name.includes('garam') || name.includes('salt')) {
    return Math.round(baseQty * 8) // ~Rp 8.000/kg
  } else if (name.includes('kecap') || name.includes('soy sauce')) {
    return Math.round(baseQty * 25) // ~Rp 25.000/liter
  } else if (name.includes('santan') || name.includes('coconut')) {
    return Math.round(baseQty * 30) // ~Rp 30.000/liter
  } else if (name.includes('coklat') || name.includes('chocolate') || name.includes('cocoa')) {
    return Math.round(baseQty * 80) // ~Rp 80.000/kg
  }
  
  // Default estimate for unknown ingredients
  return Math.round(baseQty * 25) // ~Rp 25.000/kg as default
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/recipes/generate',
    bodySchema: generateRecipeSchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, _query, body) => {
    const { prompt, servings = 4, cuisine, dietary } = body!

    // Check if OpenRouter API key is configured
    const apiKey = process.env['OPENROUTER_API_KEY']
    if (!apiKey) {
      return handleAPIError(new Error('AI Recipe Generator belum dikonfigurasi. Silakan tambahkan OPENROUTER_API_KEY di environment variables'), 'POST /api/recipes/generate')
    }

    // Fetch user's ingredients for price reference
    const { data: userIngredients } = await context.supabase
      .from('ingredients')
      .select('id, name, price_per_unit, unit, weighted_average_cost, category')
      .eq('user_id', context.user.id)
      .eq('is_active', true)
      .order('name')
      .limit(100)

    // Build ingredient context for AI
    let ingredientContext = ''
    if (userIngredients && userIngredients.length > 0) {
      ingredientContext = `\n\nREFERENSI HARGA BAHAN (gunakan harga ini sebagai acuan):\n${userIngredients.slice(0, 30).map(i => 
        `- ${i.name}: Rp ${i.price_per_unit?.toLocaleString('id-ID') || i.weighted_average_cost?.toLocaleString('id-ID')}/${i.unit}`
      ).join('\n')}`
    }

    // Build the AI prompt
    let systemPrompt = `Kamu adalah chef profesional Indonesia. Buat resep dengan harga bahan yang REALISTIS sesuai harga pasar Indonesia 2024.
    
PENTING: Harga bahan harus masuk akal! Contoh acuan:
- Ayam: ~Rp 35.000-50.000/kg
- Daging sapi: ~Rp 120.000-150.000/kg
- Telur: ~Rp 2.000-3.000/butir
- Beras: ~Rp 12.000-18.000/kg
- Tepung terigu: ~Rp 10.000-15.000/kg
- Gula: ~Rp 14.000-18.000/kg
- Minyak goreng: ~Rp 15.000-20.000/liter
- Bawang merah: ~Rp 25.000-40.000/kg
- Bawang putih: ~Rp 30.000-50.000/kg${ingredientContext}`

    if (cuisine) {
      systemPrompt += `\nJenis masakan: ${cuisine}.`
    }

    if (dietary && dietary.length > 0) {
      systemPrompt += `\nDiet khusus: ${dietary.join(', ')}.`
    }

    const userPrompt = `Buat resep untuk: ${prompt}
Porsi: ${servings} orang

Berikan resep dalam format JSON berikut:
{
  "name": "Nama resep dalam Bahasa Indonesia",
  "description": "Deskripsi singkat",
  "servings": ${servings},
  "prep_time": waktu persiapan dalam menit (angka),
  "cook_time": waktu memasak dalam menit (angka),
  "difficulty": "easy/medium/hard",
  "category": "nama kategori",
  "ingredients": [
    {
      "name": "nama bahan",
      "quantity": jumlah sebagai angka,
      "unit": "satuan (kg, gram, liter, ml, butir, buah, sdm, sdt, dll)",
      "estimated_cost": estimasi harga dalam Rupiah (HARUS REALISTIS!)
    }
  ],
  "instructions": ["Langkah 1", "Langkah 2", ...],
  "tips": "Tips memasak (opsional)"
}

INGAT: estimated_cost harus realistis sesuai harga pasar Indonesia!`

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env['NEXT_PUBLIC_APP_DOMAIN'] || 'http://localhost:3000',
        'X-Title': 'Cookinian',
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4.1-fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate recipe')
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response
    let recipe
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       aiResponse.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse
      recipe = JSON.parse(jsonString)

      // Convert difficulty to lowercase to match database format
      if (recipe.difficulty) {
        recipe.difficulty = recipe.difficulty.toLowerCase()
      }

      // Convert string times to numbers
      if (typeof recipe.prep_time === 'string') {
        recipe.prep_time = parseInt(recipe.prep_time) || 0
      }
      if (typeof recipe.cook_time === 'string') {
        recipe.cook_time = parseInt(recipe.cook_time) || 0
      }

      // Process ingredients: match with user's database and recalculate costs
      if (Array.isArray(recipe.ingredients)) {
        let totalCost = 0
        
        recipe.ingredients = recipe.ingredients.map((ing: GeneratedIngredient) => {
          // Try to match with user's ingredients
          const matchedIngredient = userIngredients 
            ? findMatchingIngredient(ing.name, userIngredients as UserIngredient[])
            : null
          
          // Calculate proper cost
          const calculatedCost = calculateIngredientCost(ing, matchedIngredient)
          totalCost += calculatedCost
          
          return {
            ...ing,
            estimated_cost: calculatedCost,
            matched_ingredient_id: matchedIngredient?.id || null,
            price_per_unit: matchedIngredient?.price_per_unit || null,
            db_unit: matchedIngredient?.unit || null,
          }
        })
        
        // Add total estimated cost to recipe
        recipe.estimated_total_cost = totalCost
        
        // Suggest selling price (30% margin)
        recipe.suggested_price = Math.ceil(totalCost * 1.3 / 1000) * 1000
      }

      // Keep instructions as array for display
      recipe.instructions_array = Array.isArray(recipe.instructions) 
        ? recipe.instructions 
        : (recipe.instructions ? recipe.instructions.split('\n') : [])
    } catch (parseError) {
      // If parsing fails, return raw response
      apiLogger.error({ parseError, aiResponse }, 'Failed to parse AI response')
      return handleAPIError(new Error('Failed to parse AI response. AI generated a response but it could not be parsed. Please try again.'), 'POST /api/recipes/generate')
    }

    // Save to history
    try {
      await context.supabase
        .from('generated_recipes')
        .insert({
          user_id: context.user.id,
          prompt,
          servings,
          cuisine: cuisine || null,
          recipe_data: recipe,
          total_estimated_cost: recipe.estimated_total_cost || null,
        })
    } catch (historyError) {
      // Don't fail if history save fails, just log it
      apiLogger.error({ historyError }, 'Failed to save recipe history')
    }

    return createSuccessResponse({
      recipe,
      usage: data.usage,
      message: 'Recipe generated successfully'
    })
  }
)
