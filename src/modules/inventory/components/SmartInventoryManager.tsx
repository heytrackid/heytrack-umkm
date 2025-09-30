'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'

// Extracted components
import { InventoryStatsCards } from './InventoryStatsCards'
import { InventoryAlerts } from './InventoryAlerts'
import { InventoryFilters } from './InventoryFilters'
import { InventoryGrid } from './InventoryGrid'
import { AlertsTab } from './AlertsTab'
import { ReorderTab } from './ReorderTab'
import { InsightsTab } from './InsightsTab'

// Services and types
import { StockCalculationService } from '../services/StockCalculationService'
import type { Ingredient } from '../types'

import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle
} from 'lucide-react'

interface SmartInventoryManagerProps {
  ingredients: Ingredient[]
  usageData?: Record<string, number> // ingredient_id -> monthly usage
  onReorderTriggered?: (ingredient: Ingredient, quantity: number) => void
}

export function SmartInventoryManager({ 
  ingredients, 
  usageData = {},
  onReorderTriggered = () => {}
}: SmartInventoryManagerProps) {
  const [analysis, setAnalysis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'critical' | 'low' | 'adequate' | 'overstocked'>('all')

  useEffec"" => {
    if (ingredients.length > 0) {
      analyzeInventory()
    }
  }, [ingredients, usageData])

  const analyzeInventory = async () => {
    setLoading(true)
    try {
      // Use new modular service instead of automation engine
      const inventoryAnalysis = StockCalculationService.analyzeStockLevels(ingredients, [])
      
      // Transform data for existing UI
      const transformedAnalysis = inventoryAnalysis.map((item: any) => ({
        ingredient: item.ingredient,
        status: item.alertLevel,
        daysRemaining: item.daysUntilReorder || item.days_until_reorder || Infinity,
        reorderRecommendation: {
          shouldReorder: item.alertLevel !== 'safe',
          quantity: item.reorderPoint.recommended_order_quantity,
          estimatedCost: item.reorderPoint.recommended_order_quantity * item.ingredient.price_per_unit,
          urgency: item.alertLevel === 'critical' ? 'urgent' : 'soon'
        },
        insights: item.recommendations || []
      }))
      
      setAnalysis(transformedAnalysis)
    } catch (error) {
      console.error('Error analyzing inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary' 
      case 'overstocked': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <TrendingDown className="h-4 w-4" />
      case 'overstocked': return <TrendingUp className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-gray-100 dark:bg-gray-8000'
      case 'soon': return 'bg-gray-100 dark:bg-gray-8000'
      default: return 'bg-gray-100 dark:bg-gray-8000'
    }
  }

  const filteredAnalysis = analysis.filter(item => 
    selectedStatus === 'all' || item.status === selectedStatus
  )

  const stats = {
    total: analysis.length,
    critical: analysis.filter(a => a.status === 'critical').length,
    low: analysis.filter(a => a.status === 'warning').length,
    needReorder: analysis.filter(a => a.reorderRecommendation.shouldReorder).length,
    totalValue: analysis.reduce((sum, a) => sum + (a.ingredient.current_stock * a.ingredient.price_per_unit), 0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Menganalisis inventory...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <InventoryStatsCards stats={stats} />

      {/* Critical Alerts */}
      <InventoryAlerts criticalCount={stats.critical} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="alerts">🚨 Alerts</TabsTrigger>
          <TabsTrigger value="reorder">🛒 Reorder</TabsTrigger>
          <TabsTrigger value="insights">💡 Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <InventoryFilters
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            stats={stats}
          />

          <InventoryGrid
            items={filteredAnalysis}
            onReorderTriggered={onReorderTriggered}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getUrgencyColor={getUrgencyColor}
          />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <AlertsTab
            items={analysis}
            onReorderTriggered={onReorderTriggered}
          />
        </TabsContent>

        {/* Reorder Tab */}
        <TabsContent value="reorder" className="space-y-4">
          <ReorderTab
            items={analysis}
            onReorderTriggered={onReorderTriggered}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <InsightsTab
            stats={stats}
            analysis={analysis}
            usageData={usageData}
            ingredients={ingredients}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SmartInventoryManager