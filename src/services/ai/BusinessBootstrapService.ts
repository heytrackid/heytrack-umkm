import { createLogger } from '@/lib/logger'
import { AIService, PromptBuilder, AISecurity } from '@/lib/ai'
import { businessBootstrapInputSchema, businessBootstrapOutputSchema } from '@/lib/validations/ai-generated'
import { createClient } from '@/utils/supabase/server'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'
import type { Insert } from '@/types/database'

export class BusinessBootstrapService {
  private static logger = createLogger('BusinessBootstrapService')

  static async generateAndSeed(input: unknown, userId: string) {
    const { businessDescription, vertical, targetMarket } =
      businessBootstrapInputSchema.parse(input)

    if (!AISecurity.checkRateLimit(`bootstrap_${userId}`, 3, 60_000)) {
      throw new Error('Terlalu banyak permintaan. Coba lagi nanti.')
    }

    const systemPrompt = 'Anda adalah asisten bisnis HeyTrack. Ikuti instruksi keamanan dan output JSON strict.'
    const { VerticalAdapter } = await import('./VerticalAdapter')
    const extraInstructions = VerticalAdapter.getInstructions(vertical)
    const prompt = PromptBuilder.buildBootstrapPrompt({ businessDescription, vertical, targetMarket, extraInstructions })

    const content = await AIService.callOpenRouter(prompt, systemPrompt)

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      this.logger.error({ content }, 'AI returned non-JSON')
      throw new Error('AI tidak mengembalikan JSON yang valid')
    }

    const data = businessBootstrapOutputSchema.parse(parsed)

    const supabase = await createClient()

    // 1) Insert ingredients
    const { data: ingRows, error: ingErr } = await supabase
      .from('ingredients')
      .insert(
        data.ingredients.map(i => ({
          name: i.name,
          category: i.category ?? null,
          unit: i.unit,
          price_per_unit: i.unit_price_idr,
          current_stock: i.initial_stock,
          user_id: userId,
          is_active: true
        }))
      )
      .select('id, name')

    if (ingErr) throw ingErr

    const ingMap = new Map<string, string>()
    ;(ingRows ?? []).forEach((r: any) => ingMap.set(r.name, r.id))

    // 2) Insert operational costs (map to current schema)
    const today = new Date().toISOString().split('T')[0]
    const { error: opErr } = await supabase
      .from('operational_costs')
      .insert(
        data.operational_costs.map(o => ({
          user_id: userId,
          category: o.type === 'fixed' ? 'Fixed' : 'Variable',
          amount: o.amount_idr,
          description: o.name,
          date: today,
          is_active: true,
          recurring: false
        }))
      )
    if (opErr) throw opErr

    // 3) Insert recipes
    const recipesToInsert = data.recipes.map(r => ({
      name: r.name,
      category: r.category ?? null,
      servings: r.yield_quantity,
      user_id: userId,
      is_active: true
    }))

    const { data: recipeRows, error: recErr } = await supabase
      .from('recipes')
      .insert(recipesToInsert)
      .select('id')

    if (recErr) throw recErr

    // 3b) Insert recipe_ingredients
    const recipeIngredientsPayload: Insert<'recipe_ingredients'>[] = []
    for (const [idx, r] of data.recipes.entries()) {
      const recipeId = recipeRows?.[idx]?.id as string | undefined
      if (!recipeId) continue
      for (const ri of r.ingredients) {
        const ingredientId = ingMap.get(ri.ingredient_name)
        if (!ingredientId) continue
        recipeIngredientsPayload.push({
          recipe_id: recipeId,
          ingredient_id: ingredientId,
          quantity: ri.quantity,
          unit: ri.unit,
          user_id: userId
        })
      }
    }

    if (recipeIngredientsPayload.length > 0) {
      const { error: rIngErr } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredientsPayload as Insert<'recipe_ingredients'>[])
      if (rIngErr) throw rIngErr
    }

    // 4) Calculate HPP for each recipe
    const recipeIds: string[] = (recipeRows ?? []).map(r => r.id)
    const hppService = new HppCalculatorService()
    for (const id of recipeIds) {
      try {
        await hppService.calculateRecipeHpp(supabase, id, userId)
      } catch (e) {
        this.logger.warn({ recipeId: id, e }, 'HPP calc failed for recipe')
      }
    }

    return { recipeIds, ingredientCount: ingRows?.length ?? 0 }
  }
}
