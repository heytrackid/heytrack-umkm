'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar,
  Clock,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Users,
  Target,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react'
import { EnhancedAutomationEngine } from '@/lib/enhanced-automation-engine'
import { useSupabaseData, useSupabaseRecord } from '@/hooks/useSupabaseCRUD'

interface ProductionPlan {
  recipe_id: string
  recipe_name: string
  planned_quantity: number
  production_date: string
  priority_score: number
  estimated_duration: number
  required_ingredients: {
    ingredient_id: string
    ingredient_name: string
    required_quantity: number
    available_quantity: number
    unit: string
    shortage?: number
  }[]
  profitability_score: number
  demand_forecast: number
  resource_efficiency: number
  bottlenecks: string[]
  recommendations: string[]
}

interface ProductionOptimization {
  optimal_sequence: ProductionPlan[]
  total_production_time: number
  resource_utilization: number
  expected_profit: number
  bottleneck_analysis: {
    critical_path: string[]
    optimization_suggestions: string[]
  }
  inventory_impact: {
    ingredients_needed: { name: string; quantity: number; unit: string }[]
    post_production_levels: { name: string; remaining: number; unit: string }[]
  }
}

function ProductionPlanningDashboard() {
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([])
  const [optimization, setOptimization] = useState<ProductionOptimization | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('planning')
  const [planningHorizon, setPlanningHorizon] = useState(7) // days
  const [capacityHours, setCapacityHours] = useState(8) // hours per day

  // Fetch data
  const { data: recipes } = useSupabaseData('recipes')
  const { data: ingredients } = useSupabaseData('ingredients')
  const { data: orders } = useSupabaseData('orders', {
    filter: { status: ['PENDING', 'IN_PROGRESS'] }
  })
  const { data: productions } = useSupabaseData('productions', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 20
  })

  // const { insertData: createProduction } = useSupabaseCRUD('productions')
  // Temporarily create a mock function
  const createProduction = async (data: any) => {
    console.log('Would create production:', data)
  }

  useEffect(() => {
    if (recipes && ingredients) {
      generateProductionPlan()
    }
  }, [recipes, ingredients, orders, planningHorizon])

  const generateProductionPlan = async () => {
    if (!recipes || !ingredients) return

    setLoading(true)
    try {
      // Generate production plans for high-demand recipes
      const plans: ProductionPlan[] = []
      
      for (const recipe of recipes.slice(0, 10)) {
        const plan = await generateRecipeProductionPlan(recipe)
        plans.push(plan)
      }

      // Sort by priority score
      plans.sort((a, b) => b.priority_score - a.priority_score)
      setProductionPlans(plans)

      // Generate optimization
      const optimization = await optimizeProductionSequence(plans)
      setOptimization(optimization)

    } catch (error) {
      console.error('Error generating production plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRecipeProductionPlan = async (recipe: any): Promise<ProductionPlan> => {
    // Calculate demand forecast based on recent orders
    const demandForecast = calculateDemandForecast(recipe.id)
    
    // Get ingredient requirements
    const requiredIngredients = await getRecipeIngredientRequirements(recipe.id)
    
    // Calculate priority score
    const priorityScore = calculatePriorityScore(recipe, demandForecast)
    
    // Estimate production duration
    const estimatedDuration = estimateProductionDuration(recipe)
    
    // Calculate profitability
    const profitabilityScore = recipe.selling_price 
      ? ((recipe.selling_price - (recipe.cost_per_serving || 0)) / recipe.selling_price) * 100
      : 30

    return {
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      planned_quantity: Math.ceil(demandForecast * planningHorizon / 7), // Weekly demand to daily
      production_date: new Date().toISOString().split('T')[0],
      priority_score: priorityScore,
      estimated_duration: estimatedDuration,
      required_ingredients: requiredIngredients,
      profitability_score: profitabilityScore,
      demand_forecast: demandForecast,
      resource_efficiency: calculateResourceEfficiency(recipe),
      bottlenecks: identifyBottlenecks(requiredIngredients),
      recommendations: generateRecommendations(recipe, requiredIngredients)
    }
  }

  const calculateDemandForecast = (recipeId: string): number => {
    if (!orders) return 5 // default

    const recipeOrders = orders.filter(order => {
      // Assuming order_items contain recipe references
      // Temporarily disabled until order_items relation is properly set up
      // return order.order_items?.some((item: any) => item.recipe_id === recipeId)
      return Math.random() > 0.5 // Mock data for now
    })

    return Math.max(recipeOrders.length * 2, 3) // minimum 3 units
  }

  const getRecipeIngredientRequirements = async (recipeId: string) => {
    // This would typically fetch from recipe_ingredients table
    // For now, return sample data
    return ingredients?.slice(0, 3).map(ingredient => ({
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      required_quantity: Math.random() * 500 + 100,
      available_quantity: ingredient.current_stock,
      unit: ingredient.unit,
      shortage: ingredient.current_stock < 200 ? 200 - ingredient.current_stock : 0
    })) || []
  }

  const calculatePriorityScore = (recipe: any, demandForecast: number): number => {
    const profitWeight = 0.4
    const demandWeight = 0.3
    const urgencyWeight = 0.3

    const profitScore = recipe.selling_price ? Math.min(recipe.selling_price / 100000, 1) : 0.5
    const demandScore = Math.min(demandForecast / 20, 1)
    const urgencyScore = 0.7 // Could be calculated based on stock levels

    return (profitScore * profitWeight + demandScore * demandWeight + urgencyScore * urgencyWeight) * 100
  }

  const estimateProductionDuration = (recipe: any): number => {
    // Base duration in minutes
    const baseDuration = recipe.prep_time_minutes || 60
    const complexity = recipe.instructions?.length || 1
    return baseDuration + (complexity * 10)
  }

  const calculateResourceEfficiency = (recipe: any): number => {
    // Simple efficiency calculation
    const servings = recipe.servings || 1
    const prepTime = recipe.prep_time_minutes || 60
    return Math.min((servings / prepTime) * 100, 100)
  }

  const identifyBottlenecks = (requiredIngredients: any[]): string[] => {
    return requiredIngredients
      .filter(ing => ing.shortage && ing.shortage > 0)
      .map(ing => `${ing.ingredient_name}: shortage of ${ing.shortage} ${ing.unit}`)
  }

  const generateRecommendations = (recipe: any, requiredIngredients: any[]): string[] => {
    const recommendations = []

    if (requiredIngredients.some(ing => ing.shortage > 0)) {
      recommendations.push('Restock ingredients before production')
    }

    if ((recipe.selling_price || 0) < 50000) {
      recommendations.push('Consider price optimization for better margins')
    }

    recommendations.push('Schedule during off-peak hours for efficiency')

    return recommendations
  }

  const optimizeProductionSequence = async (plans: ProductionPlan[]): Promise<ProductionOptimization> => {
    const viablePlans = plans.filter(plan => plan.bottlenecks.length === 0).slice(0, 6)
    
    const totalTime = viablePlans.reduce((sum, plan) => sum + plan.estimated_duration, 0)
    const expectedProfit = viablePlans.reduce((sum, plan) => 
      sum + (plan.planned_quantity * (plan.profitability_score / 100) * 50000), 0
    )

    return {
      optimal_sequence: viablePlans,
      total_production_time: totalTime,
      resource_utilization: Math.min((totalTime / (capacityHours * 60 * planningHorizon)) * 100, 100),
      expected_profit: expectedProfit,
      bottleneck_analysis: {
        critical_path: viablePlans.slice(0, 3).map(p => p.recipe_name),
        optimization_suggestions: [
          'Batch similar recipes together',
          'Prep ingredients in advance',
          'Use parallel processing where possible'
        ]
      },
      inventory_impact: {
        ingredients_needed: generateIngredientsList(viablePlans),
        post_production_levels: generatePostProductionLevels(viablePlans)
      }
    }
  }

  const generateIngredientsList = (plans: ProductionPlan[]) => {
    const ingredientMap = new Map()
    
    plans.forEach(plan => {
      plan.required_ingredients.forEach(ing => {
        const key = ing.ingredient_name
        const existing = ingredientMap.get(key) || { name: ing.ingredient_name, quantity: 0, unit: ing.unit }
        existing.quantity += ing.required_quantity * plan.planned_quantity
        ingredientMap.set(key, existing)
      })
    })

    return Array.from(ingredientMap.values())
  }

  const generatePostProductionLevels = (plans: ProductionPlan[]) => {
    return ingredients?.slice(0, 5).map(ing => ({
      name: ing.name,
      remaining: Math.max(0, ing.current_stock - Math.random() * 200),
      unit: ing.unit
    })) || []
  }

  const executeProductionPlan = async (plan: ProductionPlan) => {
    try {
      await createProduction({
        recipe_id: plan.recipe_id,
        planned_quantity: plan.planned_quantity,
        production_date: plan.production_date,
        status: 'PLANNED',
        estimated_duration: plan.estimated_duration,
        priority_score: plan.priority_score
      })
      
      // Refresh the planning
      generateProductionPlan()
    } catch (error) {
      console.error('Error creating production plan:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Production Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Smart Production Planning
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {planningHorizon} days horizon
            </Badge>
            <Button variant="outline" size="sm" onClick={generateProductionPlan}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Plan
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Planning Parameters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Planning Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Planning Horizon (days)</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={planningHorizon}
                onChange={(e) => setPlanningHorizon(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Daily Capacity (hours)</label>
              <Input
                type="number"
                min="1"
                max="24"
                value={capacityHours}
                onChange={(e) => setCapacityHours(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Production Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Production Plans</h3>
              <Badge variant="outline">
                {productionPlans.length} recipes analyzed
              </Badge>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {productionPlans.map((plan) => (
                <Card key={plan.recipe_id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{plan.recipe_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {plan.planned_quantity} units • {plan.estimated_duration} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={plan.priority_score > 70 ? 'default' : 'secondary'}>
                        Priority: {plan.priority_score.toFixed(0)}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => executeProductionPlan(plan)}
                        disabled={plan.bottlenecks.length > 0}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Plan
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Profit Score</div>
                      <div className={`font-medium ${
                        plan.profitability_score > 40 ? 'text-gray-600 dark:text-gray-400' : 
                        plan.profitability_score > 25 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {plan.profitability_score.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Demand</div>
                      <div className="font-medium">{plan.demand_forecast}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Efficiency</div>
                      <div className="font-medium">{plan.resource_efficiency.toFixed(0)}%</div>
                    </div>
                  </div>

                  {/* Bottlenecks */}
                  {plan.bottlenecks.length > 0 && (
                    <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 border border-red-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Production Blocked</span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {plan.bottlenecks.map((bottleneck, idx) => (
                          <li key={idx}>• {bottleneck}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {plan.recommendations.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Recommendations:</span>
                      {plan.recommendations.slice(0, 2).map((rec, idx) => (
                        <p key={idx} className="text-xs text-blue-700">• {rec}</p>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-4">
            {optimization && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium">Total Time</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {Math.round(optimization.total_production_time / 60)}h
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium">Utilization</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {optimization.resource_utilization.toFixed(0)}%
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium">Expected Profit</span>
                    </div>
                    <p className="text-2xl font-bold">
                      Rp {(optimization.expected_profit / 1000).toFixed(0)}K
                    </p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Recipes</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {optimization.optimal_sequence.length}
                    </p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Optimal Sequence */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Optimal Production Sequence</h4>
                    <div className="space-y-2">
                      {optimization.optimal_sequence.map((plan, idx) => (
                        <div key={plan.recipe_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                              {idx + 1}
                            </Badge>
                            <span className="font-medium text-sm">{plan.recipe_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(plan.estimated_duration / 60)}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Bottleneck Analysis */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Bottleneck Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Path:</span>
                        <div className="mt-1 space-y-1">
                          {optimization.bottleneck_analysis.critical_path.map((item, idx) => (
                            <p key={idx} className="text-sm text-blue-700">• {item}</p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Optimizations:</span>
                        <div className="mt-1 space-y-1">
                          {optimization.bottleneck_analysis.optimization_suggestions.map((suggestion, idx) => (
                            <p key={idx} className="text-sm text-green-700">• {suggestion}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: planningHorizon }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i)
                return (
                  <div key={i} className="text-center">
                    <div className="text-xs font-medium">
                      {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </div>
                    <div className="text-sm">{date.getDate()}</div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              {optimization?.optimal_sequence.slice(0, 5).map((plan, idx) => (
                <Card key={plan.recipe_id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{plan.recipe_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Day {idx + 1} • {plan.planned_quantity} units • {Math.round(plan.estimated_duration / 60)}h
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={idx === 0 ? 100 : 0} className="w-20" />
                      <Badge variant={idx === 0 ? 'default' : 'secondary'} className="text-xs">
                        {idx === 0 ? 'Active' : 'Planned'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capacity Utilization */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Capacity Utilization</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Utilization</span>
                    <span>{optimization?.resource_utilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={optimization?.resource_utilization || 0} />
                  <p className="text-xs text-muted-foreground">
                    {optimization && optimization.resource_utilization < 80 
                      ? 'Capacity available for additional production'
                      : 'Near maximum capacity - consider expanding hours'
                    }
                  </p>
                </div>
              </Card>

              {/* Ingredient Impact */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Ingredient Requirements</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {optimization?.inventory_impact.ingredients_needed.map((ing, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{ing.name}</span>
                      <span>{ing.quantity.toFixed(0)} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Production Efficiency Trends */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Efficiency Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Avg. Recipe Score</div>
                  <div className="text-xl font-bold">
                    {productionPlans.length > 0 
                      ? (productionPlans.reduce((sum, p) => sum + p.priority_score, 0) / productionPlans.length).toFixed(0)
                      : 0
                    }
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                  <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                    {productionPlans.length > 0 
                      ? (productionPlans.reduce((sum, p) => sum + p.profitability_score, 0) / productionPlans.length).toFixed(1)
                      : 0
                    }%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Bottlenecks</div>
                  <div className={`text-xl font-bold ${
                    productionPlans.filter(p => p.bottlenecks.length > 0).length === 0 
                      ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {productionPlans.filter(p => p.bottlenecks.length > 0).length}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ProductionPlanningDashboard
export { ProductionPlanningDashboard }
