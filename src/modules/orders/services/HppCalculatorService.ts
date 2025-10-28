import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'
import type { HppCalculation } from '@/modules/hpp/types'
import { HPP_CONFIG } from '@/lib/constants/hpp-config'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type Production = Database['public']['Tables']['productions']['Row']

interface HppCalculationResult {
  recipeId: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalHpp: number;
  costPerUnit: number;
  wacAdjustment: number;
  productionQuantity: number;
  materialBreakdown: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalCost: number;
  }>;
}

export class HppCalculatorService {
  private logger = dbLogger

  /**
   * Calculate HPP for a specific recipe
   */
  async calculateRecipeHpp(recipeId: string): Promise<HppCalculationResult> {
    try {
      this.logger.info({ recipeId }, 'Calculating HPP for recipe');

      const supabase = createClient()

      // Get recipe details
      const { data, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError || !data) {
        throw new Error(`Recipe not found: ${recipeId}`);
      }
      
      const recipe = data as Recipe

      // Get recipe ingredients with ingredient details
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
          *,
          ingredients:ingredient_id (
            id,
            name,
            price_per_unit,
            unit
          )
        `)
        .eq('recipe_id', recipeId);

      if (ingredientsError) {
        throw new Error(`Failed to fetch recipe ingredients: ${ingredientsError.message}`);
      }
      
      type RecipeIngredientWithIngredient = RecipeIngredient & {
        ingredients: Ingredient[]
      }
      const recipeIngredients = ingredientsData as RecipeIngredientWithIngredient[]

      // Calculate material costs
      const materialBreakdown: HppCalculationResult['materialBreakdown'] = [];
      let totalMaterialCost = 0;

      for (const ri of recipeIngredients || []) {
        // Supabase returns arrays for joined data
        const ingredients = ri.ingredients as unknown as Ingredient[]
        const ingredient = ingredients?.[0]
        if (!ingredient) {continue;}

        const quantity = Number(ri.quantity);
        const unitPrice = Number(ingredient.price_per_unit);
        const totalCost = quantity * unitPrice;

        materialBreakdown.push({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          quantity,
          unit: ri.unit,
          unitPrice,
          totalCost
        });

        totalMaterialCost += totalCost;
      }

      // Calculate labor cost from recent productions
      const laborCost = await this.calculateLaborCost(recipeId);

      // Calculate overhead cost
      const overheadCost = await this.calculateOverheadCost();

      // Apply WAC adjustment if applicable
      const wacAdjustment = await this.calculateWacAdjustment(recipeId, totalMaterialCost);

      // Calculate total HPP
      const totalHpp = totalMaterialCost + laborCost + overheadCost + wacAdjustment;
      const costPerUnit = totalHpp / (recipe.servings || 1);

      const result: HppCalculationResult = {
        recipeId,
        materialCost: totalMaterialCost,
        laborCost,
        overheadCost,
        totalHpp,
        costPerUnit,
        wacAdjustment,
        productionQuantity: recipe.servings || 1,
        materialBreakdown
      };

      // Save calculation to database
      await this.saveHppCalculation(result);

      this.logger.info({ recipeId, totalHpp }, 'HPP calculated for recipe');
      return result;

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to calculate HPP for recipe ${recipeId}`);
      throw err;
    }
  }

  /**
   * Calculate labor cost based on recent production batches
   */
  private async calculateLaborCost(recipeId: string): Promise<number> {
    try {
      const supabase = createClient()
      
      // Get recent productions for this recipe
      const { data: productions, error } = await supabase
        .from('productions')
        .select('labor_cost, actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('status', 'COMPLETED')
        .order('actual_end_time', { ascending: false })
        .limit(10);

      if (error) {
        this.logger.warn({ error: error.message }, 'Failed to fetch productions for labor cost');
        return 0;
      }

      if (!productions || productions.length === 0) {
        // Fallback: estimate based on average labor cost per serving
        return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
      }

      // Calculate average labor cost per unit
      const totalLaborCost = productions.reduce((sum: number, p: Production) => sum + Number(p.labor_cost), 0);
      const totalQuantity = productions.reduce((sum: number, p: Production) => sum + Number(p.actual_quantity), 0);

      return totalQuantity > 0 ? totalLaborCost / totalQuantity : 0;

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to calculate labor cost');
      return 0;
    }
  }

  /**
   * Calculate overhead cost allocation
   */
  private async calculateOverheadCost(): Promise<number> {
    try {
      const supabase = createClient()
      
      // Get active operational costs
      const { data: operationalCosts, error} = await supabase
        .from('operational_costs')
        .select('*')
        .eq('is_active', true);

      if (error) {
        this.logger.warn({ error: error.message }, 'Failed to fetch operational costs');
        return 0;
      }

      if (!operationalCosts || operationalCosts.length === 0) {
        // Fallback: estimate overhead per serving
        return HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
      }

      // For now, allocate equally across all recipes
      // TODO: Implement different allocation methods
      const totalOverhead = operationalCosts.reduce((sum: number, cost: { amount: number }) => sum + Number(cost.amount), 0);

      // Get total number of active recipes for equal allocation
      const { count: recipeCount, error: countError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (countError || !recipeCount) {
        return totalOverhead / HPP_CONFIG.FALLBACK_RECIPE_COUNT
      }

      return totalOverhead / recipeCount;

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to calculate overhead cost');
      return 0;
    }
  }

  /**
   * Calculate WAC (Weighted Average Cost) adjustment
   */
  private async calculateWacAdjustment(recipeId: string, _currentMaterialCost: number): Promise<number> {
    try {
      const supabase = createClient()
      
      // Get recent stock transactions for ingredients used in this recipe
      const { data: ingredientsData } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_id')
        .eq('recipe_id', recipeId);

      if (!ingredientsData || ingredientsData.length === 0) {
        return 0;
      }
      
      const recipeIngredients = ingredientsData as Pick<RecipeIngredient, 'ingredient_id'>[]
      const ingredientIds = recipeIngredients.map(ri => ri.ingredient_id);

      // Get recent purchases for these ingredients
      const { data: transactionsData, error } = await supabase
        .from('stock_transactions')
        .select('ingredient_id, quantity, unit_price, total_price')
        .in('ingredient_id', ingredientIds)
        .eq('type', 'PURCHASE')
        .order('created_at', { ascending: false })
        .limit(HPP_CONFIG.WAC_LOOKBACK_TRANSACTIONS)

      if (error || !transactionsData) {
        return 0;
      }
      
      type StockTransactionForWAC = Pick<Database['public']['Tables']['stock_transactions']['Row'], 'ingredient_id' | 'quantity' | 'unit_price' | 'total_price'>
      const transactions = transactionsData as StockTransactionForWAC[]

      // Calculate WAC for each ingredient and adjust if current price differs
      let totalAdjustment = 0;

      for (const ingredientId of ingredientIds) {
        const ingredientTransactions = transactions.filter(t => t.ingredient_id === ingredientId);

        if (ingredientTransactions.length === 0) {continue;}

        // Calculate weighted average cost
        const totalQuantity = ingredientTransactions.reduce((sum: number, t) => sum + Number(t.quantity), 0);
        const totalValue = ingredientTransactions.reduce((sum: number, t) => sum + Number(t.total_price ?? 0), 0);
        const wac = totalQuantity > 0 ? totalValue / totalQuantity : 0;

        // Get current price from ingredients table
        const { data: ingredientData } = await supabase
          .from('ingredients')
          .select('price_per_unit')
          .eq('id', ingredientId)
          .single();

        const ingredient = ingredientData as Pick<Ingredient, 'price_per_unit'> | null
        
        if (ingredient && wac > 0 && ingredientTransactions[0]) {
          const currentPrice = Number(ingredient.price_per_unit);
          const adjustment = (wac - currentPrice) * ingredientTransactions[0].quantity; // Adjust for the quantity used
          totalAdjustment += adjustment;
        }
      }

      return totalAdjustment;

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to calculate WAC adjustment');
      return 0;
    }
  }

  /**
   * Save HPP calculation to database
   */
  private async saveHppCalculation(result: HppCalculationResult): Promise<void> {
    try {
      const supabase = createClient()
      
      type HppCalculationInsert = Database['public']['Tables']['hpp_calculations']['Insert']
      
      const calculationData: HppCalculationInsert = {
        recipe_id: result.recipeId,
        calculation_date: new Date().toISOString().split('T')[0],
        material_cost: result.materialCost,
        labor_cost: result.laborCost,
        overhead_cost: result.overheadCost,
        total_hpp: result.totalHpp,
        cost_per_unit: result.costPerUnit,
        wac_adjustment: result.wacAdjustment,
        production_quantity: result.productionQuantity,
        notes: `Auto-calculated HPP for ${result.productionQuantity} servings`
      };

      const { error } = await (supabase as any)
        .from('hpp_calculations')
        .insert(calculationData);

      if (error) {
        throw new Error(`Failed to save HPP calculation: ${error.message}`);
      }

      this.logger.info({ recipeId: result.recipeId }, 'HPP calculation saved for recipe');

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to save HPP calculation');
      throw err;
    }
  }

  /**
   * Get latest HPP for a recipe
   */
  async getLatestHpp(recipeId: string): Promise<HppCalculation | null> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('hpp_calculations')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch latest HPP: ${error.message}`);
      }

      return data || null;

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to get latest HPP for recipe ${recipeId}`);
      throw err;
    }
  }
}
