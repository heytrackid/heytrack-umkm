'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Package, ShoppingCart, TrendingUp, RefreshCw } from 'lucide-react'
import { useInventoryAlerts, useReorderManagement } from '@/hooks'
import { InventoryAlertsList } from '@/hooks/useInventoryAlerts'
import { useSettings } from '@/contexts/settings-context'



export const InventoryDashboard = () => {
  const { formatCurrency } = useSettings()
  const { inventoryStatus, loading: alertsLoading, refetch: refetchAlerts } = useInventoryAlerts()
  const { reorderData, loading: reorderLoading, refetch: refetchReorder } = useReorderManagement()

  const handleRefresh = () => {
    refetchAlerts()
    refetchReorder()
  }

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
          {[...Array(4)].map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Monitor stock levels and reorder suggestions</p>
        </div>
        <Button onClick={handleRefresh} disabled={alertsLoading || reorderLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${(alertsLoading || reorderLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStatus.total_ingredients}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryStatus.healthy_stock_count} in good stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventoryStatus.low_stock_count + inventoryStatus.out_of_stock_count}
            </div>
            <p className="text-xs text-muted-foreground">
              {inventoryStatus.out_of_stock_count} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Suggestions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reorderData.total_suggestions}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(reorderData.total_estimated_cost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryStatus.total_value)}</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Stock Alerts
            </CardTitle>
            <CardDescription>
              Items requiring attention ({inventoryStatus.alerts.length} alerts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryAlertsList alerts={inventoryStatus.alerts} maxItems={5} />
          </CardContent>
        </Card>

        {/* Reorder Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              Reorder Suggestions
            </CardTitle>
            <CardDescription>
              Recommended purchases ({reorderData.total_suggestions} items)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reorderData.suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No reorder suggestions at this time</p>
                <p className="text-sm">All items are sufficiently stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reorderData.suggestions.slice(0, 5).map((suggestion) => (
                  <div key={suggestion.ingredient_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{suggestion.ingredient_name}</p>
                        <Badge
                          variant={
                            suggestion.priority === 'urgent' ? 'destructive' :
                              suggestion.priority === 'high' ? 'destructive' :
                                suggestion.priority === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {suggestion.current_stock} {suggestion.unit} •
                        Suggested: {suggestion.suggested_quantity} {suggestion.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(suggestion.total_cost)}</p>
                      <p className="text-xs text-muted-foreground">
                        @ {formatCurrency(suggestion.unit_cost)}/{suggestion.unit}
                      </p>
                    </div>
                  </div>
                ))}
                {reorderData.suggestions.length > 5 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">
                      +{reorderData.suggestions.length - 5} more suggestions
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      {reorderData.total_suggestions > 0 && (
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
                <div className="text-2xl font-bold text-red-600">{reorderData.urgent_count}</div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <Progress value={(reorderData.urgent_count / reorderData.total_suggestions) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{reorderData.high_count}</div>
                <p className="text-sm text-muted-foreground">High</p>
                <Progress value={(reorderData.high_count / reorderData.total_suggestions) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{reorderData.medium_count}</div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <Progress value={(reorderData.medium_count / reorderData.total_suggestions) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{reorderData.low_count}</div>
                <p className="text-sm text-muted-foreground">Low</p>
                <Progress value={(reorderData.low_count / reorderData.total_suggestions) * 100} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
