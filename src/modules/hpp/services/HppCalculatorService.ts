import { dbLogger } from '@/lib/logger'
import supabase from '@/utils/supabase'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type Production = Database['public']['Tables']['productions']['Row']

// Temporary interface until supabase types are regenerated
interface HppCalculation {
  id: string
  recipe_id: string
  calculation_date: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
  wac_adjustment: number
  production_quantity: number
  notes?: string
  created_at: string
}

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
      this.logger.info(`Calculating HPP for recipe ${recipeId}`);

      // Get recipe details
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError || !recipe) {
        throw new Error(`Recipe not found: ${recipeId}`);
      }

      // Get recipe ingredients with ingredient details
      const { data: recipeIngredients, error: ingredientsError } = await supabase
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

      // Calculate material costs
      const materialBreakdown: HppCalculationResult['materialBreakdown'] = [];
      let totalMaterialCost = 0;

      for (const ri of recipeIngredients || []) {
        const ingredient = ri.ingredients as Ingredient;
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
      const overheadCost = await this.calculateOverheadCost(recipeId);

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

      this.logger.info(`HPP calculated for recipe ${recipeId}: ${totalHpp}`);
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
      // Get recent productions for this recipe
      const { data: productions, error } = await supabase
        .from('productions')
        .select('labor_cost, actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('status', 'COMPLETED')
        .order('actual_end_time', { ascending: false })
        .limit(10);

      if (error) {
        this.logger.warn(`Failed to fetch productions for labor cost: ${error.message}`);
        return 0;
      }

      if (!productions || productions.length === 0) {
        // Fallback: estimate based on average labor cost per serving
        return 5000; // IDR per serving
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
  private async calculateOverheadCost(recipeId: string): Promise<number> {
    try {
      // Get active operational costs
      const { data: operationalCosts, error } = await supabase
        .from('operational_costs')
        .select('*')
        .eq('is_active', true);

      if (error) {
        this.logger.warn(`Failed to fetch operational costs: ${error.message}`);
        return 0;
      }

      if (!operationalCosts || operationalCosts.length === 0) {
        // Fallback: estimate overhead per serving
        return 2000; // IDR per serving
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
        return totalOverhead / 10; // Assume 10 recipes as fallback
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
      // Get recent stock transactions for ingredients used in this recipe
      const { data: recipeIngredients } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_id')
        .eq('recipe_id', recipeId);

      if (!recipeIngredients || recipeIngredients.length === 0) {
        return 0;
      }

      const ingredientIds = recipeIngredients.map(ri => ri.ingredient_id);

      // Get recent purchases for these ingredients
      const { data: transactions, error } = await supabase
        .from('stock_transactions')
        .select('ingredient_id, quantity, unit_price, total_value')
        .in('ingredient_id', ingredientIds)
        .eq('type', 'PURCHASE')
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error || !transactions) {
        return 0;
      }

      // Calculate WAC for each ingredient and adjust if current price differs
      let totalAdjustment = 0;

      for (const ingredientId of ingredientIds) {
        const ingredientTransactions = transactions.filter(t => t.ingredient_id === ingredientId);

        if (ingredientTransactions.length === 0) {continue;}

        // Calculate weighted average cost
        const totalQuantity = ingredientTransactions.reduce((sum: number, t: { quantity: number }) => sum + Number(t.quantity), 0);
        const totalValue = ingredientTransactions.reduce((sum: number, t: { total_value: number }) => sum + Number(t.total_value), 0);
        const wac = totalQuantity > 0 ? totalValue / totalQuantity : 0;

        // Get current price from ingredients table
        const { data: ingredient } = await supabase
          .from('ingredients')
          .select('price_per_unit')
          .eq('id', ingredientId)
          .single();

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
      const calculationData = {
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

      const { error } = await supabase
        .from('hpp_calculations')
        .insert(calculationData);

      if (error) {
        throw new Error(`Failed to save HPP calculation: ${error.message}`);
      }

      this.logger.info(`HPP calculation saved for recipe ${result.recipeId}`);

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
