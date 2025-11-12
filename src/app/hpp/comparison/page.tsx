'use client'

import { BarChart3, Package, Target, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader, SharedStatsCards } from '@/components/shared/index'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { dbLogger } from '@/lib/logger'
// No imports needed for now

interface RecipeComparison {
  id: string
  name: string
  category: string
  hppValue: number
  sellingPrice: number
  margin: number
  marginPercentage: number
  timesMade: number
  lastMade: string | null
  profitability: 'high' | 'low' | 'medium'
  efficiency: 'high' | 'low' | 'medium'
}

interface BenchmarkData {
  averageHpp: number
  averageMargin: number
  averagePrice: number
  topPerformer: RecipeComparison | null
  worstPerformer: RecipeComparison | null
  totalRevenue: number
  totalProduction: number
}

const ComparisonAnalyticsPage = (): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<RecipeComparison[]>([])
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('margin')

  // Load comparison data
  useEffect(() => {
    void loadComparisonData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const loadComparisonData = async (): Promise<void> => {
    try {
      setLoading(true)

      // Get recipes with HPP data
     const params = new URLSearchParams()
     if (selectedCategory !== 'all') {
       params.append('category', selectedCategory)
     }
     // Forward date range params if present
     const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
     const from = urlParams?.get('from')
     const to = urlParams?.get('to')
     if (from) params.set('from', from)
     if (to) params.set('to', to)

     const response = await fetch(`/api/hpp/comparison?${params.toString()}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (response.ok) {
        const data = await response.json() as { recipes?: RecipeComparison[]; benchmark?: BenchmarkData }
        setRecipes(data.recipes ?? [])
        setBenchmark(data.benchmark ?? null)
      }
    } catch (_error) {
      dbLogger.error({ _error }, 'Failed to load comparison data')
      toast({
        title: 'Error',
        description: 'Failed to load comparison data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'high': return 'text-muted-foreground'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'high': return 'text-muted-foreground'
      case 'medium': return 'text-muted-foreground'
      case 'low': return 'text-orange-600'
      default: return 'text-muted-foreground'
    }
  }

  const sortedRecipes = [...recipes].sort((a, b) => {
    switch (sortBy) {
      case 'margin':
        return b.marginPercentage - a.marginPercentage
      case 'hpp':
        return a.hppValue - b.hppValue
      case 'sales':
        return b.timesMade - a.timesMade
      case 'price':
        return b.sellingPrice - a.sellingPrice
      default:
        return 0
    }
  })

  const categories = Array.from(new Set(recipes.map(r => r.category)))

  return (
    <AppLayout pageTitle="Comparison Analytics">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
         <PageHeader
           title="Recipe Comparison"
           description="Benchmarking dan analisis komparatif antar resep"
         />

       </div>

        {/* Stats Cards */}
        <SharedStatsCards
          stats={[
            {
              title: "Total Recipes",
              value: recipes.length.toString(),
              subtitle: "Jumlah resep yang tersedia",
              icon: <Package className="h-4 w-4" />
            },
            {
              title: "Avg. Margin",
              value: `${Math.round(recipes.reduce((sum, r) => sum + (r.marginPercentage || 0), 0) / (recipes.length || 1))}%`,
              subtitle: "Margin keuntungan rata-rata",
              icon: <Target className="h-4 w-4" />
            },
            {
              title: "Best Performer",
              value: recipes.length > 0 ? recipes.reduce((best, r) => (r.marginPercentage || 0) > (best.marginPercentage || 0) ? r : best).name : "-",
              subtitle: "Resep dengan margin tertinggi",
              icon: <TrendingUp className="h-4 w-4" />
            },
            {
              title: "Active Users",
              value: "0",
              subtitle: "Pengguna aktif bulan ini",
              icon: <Users className="h-4 w-4" />
            }
          ]}
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <label htmlFor="category-filter" className="text-sm font-medium">Category Filter</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="sort-by" className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="margin">Highest Margin</SelectItem>
                    <SelectItem value="hpp">Lowest HPP</SelectItem>
                    <SelectItem value="sales">Most Sales</SelectItem>
                    <SelectItem value="price">Highest Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benchmark Overview */}
        {benchmark && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-muted-foreground">
                  {formatCurrency(benchmark.averageHpp)}
                </div>
                <p className="text-sm text-muted-foreground">Average HPP</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-muted-foreground">
                  {benchmark.averageMargin.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Average Margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-muted-foreground">
                  {formatCurrency(benchmark.averagePrice)}
                </div>
                <p className="text-sm text-muted-foreground">Average Price</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {benchmark.totalProduction}
                </div>
                <p className="text-sm text-muted-foreground">Total Production</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Comparison Table</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              if (loading) {
                return (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                )
              }
              if (sortedRecipes.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    No recipe data available for comparison
                  </div>
                )
              }
              return (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipe</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">HPP</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead>Profitability</TableHead>
                      <TableHead>Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRecipes.map((recipe) => (
                      <TableRow key={recipe['id']}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{recipe.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(recipe.hppValue)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(recipe.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className="font-semibold">{recipe.marginPercentage.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(recipe.margin)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {recipe.timesMade}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getProfitabilityColor(recipe.profitability)}>
                            {recipe.profitability}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getEfficiencyColor(recipe.efficiency)}>
                            {recipe.efficiency}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Top Performers */}
        {benchmark && (benchmark.topPerformer ?? benchmark.worstPerformer) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benchmark.topPerformer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-5 w-5" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{benchmark.topPerformer.name}</h3>
                    <Badge variant="outline">{benchmark.topPerformer.category}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {benchmark.topPerformer.marginPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Margin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {benchmark.topPerformer.timesMade}
                      </div>
                      <div className="text-sm text-muted-foreground">Sales</div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    HPP: {formatCurrency(benchmark.topPerformer.hppValue)} |
                    Price: {formatCurrency(benchmark.topPerformer.sellingPrice)}
                  </div>
                </CardContent>
              </Card>
            )}

            {benchmark.worstPerformer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    Needs Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{benchmark.worstPerformer.name}</h3>
                    <Badge variant="outline">{benchmark.worstPerformer.category}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {benchmark.worstPerformer.marginPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Margin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {benchmark.worstPerformer.timesMade}
                      </div>
                      <div className="text-sm text-muted-foreground">Sales</div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    HPP: {formatCurrency(benchmark.worstPerformer.hppValue)} |
                    Price: {formatCurrency(benchmark.worstPerformer.sellingPrice)}
                  </div>

                  <Button variant="outline" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Optimize Recipe
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Comparison Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Margin Distribution</h4>
                <p className="text-sm text-muted-foreground">
                  Compare profit margins across all recipes to identify optimization opportunities
                </p>
              </div>

              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Performance Benchmarking</h4>
                <p className="text-sm text-muted-foreground">
                  Identify top performers and recipes that need improvement
                </p>
              </div>

              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Trend Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Track how recipe performance changes over time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default ComparisonAnalyticsPage