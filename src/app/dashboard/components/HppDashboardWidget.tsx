'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import { dbLogger } from '@/lib/logger'
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SharedStatsCards, PageHeader } from '@/components/shared'
import {
  StatsCardSkeleton,
  QuickActionsSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'

interface HppDashboardData {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  averageMargin: number
  totalAlerts: number
  unreadAlerts: number
  topRecipes: Array<{
    id: string
    name: string
    hpp_value: number
    margin_percentage: number
    last_updated: string
  }>
  recentChanges: Array<{
    recipe_id: string
    recipe_name: string
    change_percentage: number
    direction: 'increase' | 'decrease'
  }>
}

export default function HppDashboardWidget() {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const router = useRouter()
  const [data, setData] = useState<HppDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadHppData()
  }, [])

  const loadHppData = async () => {
    try {
      void setLoading(true)

      // Load summary data - this would come from a new API endpoint
      // For now, we'll use placeholder data
      const mockData: HppDashboardData = {
        totalRecipes: 15,
        recipesWithHpp: 12,
        averageHpp: 45000,
        averageMargin: 35,
        totalAlerts: 3,
        unreadAlerts: 2,
        topRecipes: [
          {
            id: '1',
            name: 'Nasi Goreng Special',
            hpp_value: 25000,
            margin_percentage: 45,
            last_updated: '2025-01-26'
          },
          {
            id: '2',
            name: 'Ayam Bakar Madu',
            hpp_value: 35000,
            margin_percentage: 40,
            last_updated: '2025-01-26'
          },
          {
            id: '3',
            name: 'Sate Ayam',
            hpp_value: 30000,
            margin_percentage: 38,
            last_updated: '2025-01-25'
          }
        ],
        recentChanges: [
          {
            recipe_id: '1',
            recipe_name: 'Nasi Goreng Special',
            change_percentage: 5.2,
            direction: 'increase'
          },
          {
            recipe_id: '4',
            recipe_name: 'Mie Goreng',
            change_percentage: -3.1,
            direction: 'decrease'
          }
        ]
      }

      void setData(mockData)
    } catch (err: unknown) {
      dbLogger.error({ err: error }, 'Failed to load HPP dashboard data')
      toast({
        title: 'Error',
        description: 'Failed to load HPP data',
        variant: 'destructive'
      })
    } finally {
      void setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            HPP & Costing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
            <QuickActionsSkeleton className="h-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          HPP & Costing Overview
          {data.unreadAlerts > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {data.unreadAlerts} alerts
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.recipesWithHpp}/{data.totalRecipes}
            </div>
            <div className="text-sm text-muted-foreground">Recipes with HPP</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.averageHpp)}
            </div>
            <div className="text-sm text-muted-foreground">Average HPP</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.averageMargin}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Margin</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${data.unreadAlerts > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {data.totalAlerts}
            </div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </div>
        </div>

        {/* Top Recipes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Top Recipes by Margin</h4>
            <Button variant="ghost" size="sm" onClick={() => router.push('/hpp/calculator')}>
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {data.topRecipes.map((recipe) => (
              <div key={recipe.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{recipe.name}</div>
                  <div className="text-sm text-muted-foreground">
                    HPP: {formatCurrency(recipe.hpp_value)}
                  </div>
                </div>
                <Badge variant="secondary">
                  {recipe.margin_percentage}% margin
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Changes */}
        {data.recentChanges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Recent HPP Changes</h4>
              <Button variant="ghost" size="sm" onClick={() => router.push('/hpp/alerts')}>
                View Alerts
              </Button>
            </div>
            <div className="space-y-2">
              {data.recentChanges.map((change, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{change.recipe_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {change.direction === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`font-semibold ${
                      change.direction === 'increase' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {change.direction === 'increase' ? '+' : ''}{change.change_percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={() => router.push('/hpp/calculator')}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate HPP
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push('/hpp/snapshots')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Trends
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
