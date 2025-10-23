/**
 * CostBreakdownChart Component - Usage Example
 * 
 * This component displays a pie chart showing the breakdown of HPP costs
 * between material costs and operational costs, along with detailed
 * ingredient breakdowns.
 * 
 * Features:
 * - Interactive pie chart with hover effects
 * - Click on segments to show detailed breakdown
 * - Top 5 most expensive ingredients
 * - Highlights ingredients with price increases > 15%
 * - Expandable section to view all ingredients
 * - Mobile responsive design
 */

'use client'

import CostBreakdownChart from './CostBreakdownChart'

export default function CostBreakdownChartExample() {
    // Example 1: Basic usage with recipe ID
    return (
        <div className="space-y-6 p-6">
            <h2 className="text-2xl font-bold">Cost Breakdown Chart Examples</h2>

            {/* Example 1: Basic Usage */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Example 1: Basic Usage</h3>
                <CostBreakdownChart
                    recipeId="your-recipe-id-here"
                    recipeName="Nasi Goreng Spesial"
                />
            </div>

            {/* Example 2: With specific date */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Example 2: With Specific Date</h3>
                <CostBreakdownChart
                    recipeId="your-recipe-id-here"
                    recipeName="Nasi Goreng Spesial"
                    date="2025-01-22"
                />
            </div>

            {/* Example 3: With custom className */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Example 3: With Custom Styling</h3>
                <CostBreakdownChart
                    recipeId="your-recipe-id-here"
                    recipeName="Nasi Goreng Spesial"
                    className="shadow-lg"
                />
            </div>
        </div>
    )
}

/**
 * Integration Example in HPP Page
 * 
 * Add this to your HPP page tabs:
 */

/*
import CostBreakdownChart from './components/CostBreakdownChart'

// Inside your component:
<Tabs defaultValue="hpp-calculator">
  <TabsList>
    <TabsTrigger value="hpp-calculator">Kalkulator HPP</TabsTrigger>
    <TabsTrigger value="pricing-strategy">Strategi Pricing</TabsTrigger>
    <TabsTrigger value="cost-breakdown">Breakdown Biaya</TabsTrigger>
  </TabsList>

  <TabsContent value="cost-breakdown">
    <CostBreakdownChart
      recipeId={selectedRecipeId}
      recipeName={selectedRecipe?.name}
    />
  </TabsContent>
</Tabs>
*/

/**
 * Props Interface:
 * 
 * interface CostBreakdownChartProps {
 *   recipeId: string          // Required: The recipe ID to fetch breakdown for
 *   recipeName?: string       // Optional: Display name for the recipe
 *   date?: string            // Optional: Specific date for snapshot (ISO format)
 *   className?: string       // Optional: Additional CSS classes
 * }
 */

/**
 * Features Implemented:
 * 
 * ✅ Subtask 9.1: Create CostBreakdownChart component
 *    - Pie chart using Recharts
 *    - Material vs operational cost split
 *    - Percentages displayed on chart segments
 *    - Legend with cost values
 * 
 * ✅ Subtask 9.2: Add detailed breakdown view
 *    - Top 5 ingredients by cost
 *    - Cost and percentage for each ingredient
 *    - Highlights ingredients with price increases > 15%
 *    - Expandable section for full ingredient list
 * 
 * ✅ Subtask 9.3: Add interactive features
 *    - Click on pie segment to show details
 *    - Hover effects with tooltips
 *    - Drill-down to ingredient details
 *    - Operational costs detail view when segment is clicked
 */

/**
 * API Endpoint Used:
 * 
 * GET /api/hpp/breakdown?recipe_id={id}&date={date}
 * 
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     total_hpp: number,
 *     material_cost: number,
 *     operational_cost: number,
 *     breakdown: {
 *       ingredients: Array<{
 *         id: string,
 *         name: string,
 *         cost: number,
 *         percentage: number,
 *         previous_cost?: number,
 *         change_percentage?: number,
 *         has_significant_change?: boolean
 *       }>,
 *       operational: Array<{
 *         category: string,
 *         cost: number,
 *         percentage: number
 *       }>,
 *       all_ingredients: IngredientCost[]
 *     },
 *     snapshot_date: string
 *   },
 *   meta: {
 *     recipe_name: string,
 *     total_ingredients: number,
 *     has_previous_data: boolean
 *   }
 * }
 */
