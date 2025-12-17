'use client'

import { AlertTriangle, Package, RefreshCw, Search, ShoppingCart, TrendingUp } from '@/components/icons'
import { memo, useCallback, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import { useSettings } from '@/contexts/settings-context'
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts'
import { useReorderSuggestions } from '@/hooks/useReorderManagement'
import { cn } from '@/lib/utils'
import type { ReorderSuggestionWithDetails } from '@/types/database'

const InventoryDashboardComponent = (): JSX.Element => {
  const { formatCurrency } = useSettings()
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useInventoryAlerts()
  const { data: reorderData = [], isLoading: reorderLoading, refetch: refetchReorder } = useReorderSuggestions()

  const [searchTerm, setSearchTerm] = useState('')

  // Memoize expensive calculations
  const reorderSummary = useMemo(() => ({
    total_suggestions: reorderData.length,
    total_estimated_cost: reorderData.reduce((sum, item) => sum + (item.estimated_cost || 0), 0),
    urgent_count: reorderData.filter(item => item.priority === 'high').length,
    high_count: reorderData.filter(item => item.priority === 'high').length,
    medium_count: reorderData.filter(item => item.priority === 'medium').length,
    low_count: reorderData.filter(item => item.priority === 'low').length,
  }), [reorderData])

  const inventoryStatus = useMemo(() => ({
    total_ingredients: (alertsData || []).length,
    healthy_stock_count: 0,
    low_stock_count: (alertsData || []).filter((a) => a.alert_type === 'low_stock').length,
    out_of_stock_count: (alertsData || []).filter((a) => a.alert_type === 'out_of_stock').length,
    total_value: 0,
  }), [alertsData])

  const handleRefresh = useCallback(() => {
    refetchAlerts()
    refetchReorder()
  }, [refetchAlerts, refetchReorder])

  const filteredAlerts = useMemo(() => 
    (alertsData || []).filter((alert) =>
      alert.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [alertsData, searchTerm]
  )

  const filteredSuggestions = useMemo(() => 
    (reorderData || []).filter((suggestion: ReorderSuggestionWithDetails) =>
      suggestion.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [reorderData, searchTerm]
  )

  if (alertsLoading || reorderLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Inventory Management</h2>
            <p className="text-muted-foreground">Monitor stock levels and reorder suggestions</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Memuat...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Monitor stock levels and reorder suggestions</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
              aria-label="Search ingredients"
            />
          </div>
          <Button onClick={handleRefresh} disabled={alertsLoading || reorderLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", (alertsLoading || reorderLoading) && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <UiStatsCards
        stats={([
          {
            title: 'Total Ingredients',
            value: inventoryStatus.total_ingredients,
            description: `${inventoryStatus.healthy_stock_count} in good stock`,
            icon: Package,
          },
          {
            title: 'Low Stock Alerts',
            value: inventoryStatus.low_stock_count + inventoryStatus.out_of_stock_count,
            description: `${inventoryStatus.out_of_stock_count} out of stock`,
            icon: AlertTriangle,
            iconClassName: 'text-orange-600',
          },
          {
            title: 'Reorder Suggestions',
            value: reorderData.length,
            description: formatCurrency(reorderData.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)),
            icon: ShoppingCart,
          },
          {
            title: 'Inventory Value',
            value: formatCurrency(inventoryStatus.total_value),
            description: 'Current stock value',
            icon: TrendingUp,
          },
        ] satisfies StatCardData[])}
        gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Stock Alerts
            </CardTitle>
            <CardDescription>
              Items requiring attention ({filteredAlerts.length} alerts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{alert.ingredient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {alert.current_stock} • {alert.alert_type}
                    </p>
                  </div>
                  <Badge variant={alert.alert_type === 'out_of_stock' ? 'destructive' : 'secondary'}>
                    {alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
              ))}
              {filteredAlerts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No alerts</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reorder Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              Reorder Suggestions
            </CardTitle>
            <CardDescription>
              Recommended purchases ({filteredSuggestions.length} items)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No reorder suggestions at this time</p>
                <p className="text-sm">All items are sufficiently stocked</p>
              </div>
            ) : (
               <div className="space-y-3">
                   {filteredSuggestions.slice(0, 5).map((suggestion: ReorderSuggestionWithDetails) => (
                   <div key={suggestion.ingredient_id} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex-1">
                       <div className="flex items-center gap-2">
                         <p className="font-medium text-sm">{suggestion.ingredient_name}</p>
                        <Badge
                          variant={
                            suggestion.priority === 'high' ? 'destructive' :
                              suggestion.priority === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {(suggestion.priority || 'low').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {suggestion.current_stock} {suggestion.unit} •
                        Suggested: {suggestion.suggested_quantity} {suggestion.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(suggestion.estimated_cost)}</p>
                      <p className="text-xs text-muted-foreground">
                        @ {formatCurrency(suggestion.last_purchase_price || 0)}/{suggestion.unit}
                      </p>
                    </div>
                  </div>
                ))}
                 {filteredSuggestions.length > 5 && (
                   <div className="text-center py-2">
                     <p className="text-sm text-muted-foreground">
                       +{filteredSuggestions.length - 5} more suggestions
                     </p>
                   </div>
                 )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      {reorderSummary.total_suggestions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reorder Priority Breakdown</CardTitle>
            <CardDescription>
              Items grouped by urgency level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{reorderSummary.urgent_count}</div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <Progress value={(reorderSummary.urgent_count / reorderSummary.total_suggestions) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{reorderSummary.high_count}</div>
                <p className="text-sm text-muted-foreground">High</p>
                <Progress value={(reorderSummary.high_count / reorderSummary.total_suggestions) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{reorderSummary.medium_count}</div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <Progress value={(reorderSummary.medium_count / reorderSummary.total_suggestions) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{reorderSummary.low_count}</div>
                <p className="text-sm text-muted-foreground">Low</p>
                <Progress value={(reorderSummary.low_count / reorderSummary.total_suggestions) * 100} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Memoized export for performance
export const InventoryDashboard = memo(InventoryDashboardComponent)

