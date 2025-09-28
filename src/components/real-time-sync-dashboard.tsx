import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDataStore, useRealTimeSync, getIngredientStatus, getRecipeAvailability } from '@/lib/data-synchronization'
import { 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Database,
  Zap,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Link,
  Unlink
} from 'lucide-react'

interface RealTimeSyncDashboardProps {
  showDetailed?: boolean
}

export function RealTimeSyncDashboard({ showDetailed = false }: RealTimeSyncDashboardProps) {
  const { isOnline, lastSyncTime, syncEvents, syncNow } = useRealTimeSync()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastEventTime, setLastEventTime] = useState<Date>(new Date())
  
  // Get store data for sync status
  const ingredients = useDataStore((state) => state.ingredients)
  const recipes = useDataStore((state) => state.recipes)
  const orders = useDataStore((state) => state.orders)
  const customers = useDataStore((state) => state.customers)
  const reports = useDataStore((state) => state.reports)
  
  // Update last event time when new events come in
  useEffect(() => {
    if (syncEvents.length > 0) {
      setLastEventTime(syncEvents[syncEvents.length - 1].timestamp)
    }
  }, [syncEvents])
  
  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncNow()
    } finally {
      setTimeout(() => setIsSyncing(false), 1000)
    }
  }
  
  const getTimeSinceLastSync = () => {
    const diff = new Date().getTime() - lastSyncTime.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s ago`
    }
    return `${seconds}s ago`
  }
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ingredient_updated': return <Package className="h-3 w-3" />
      case 'recipe_updated': return <Activity className="h-3 w-3" />
      case 'order_created': 
      case 'order_updated': return <ShoppingCart className="h-3 w-3" />
      case 'stock_consumed': return <AlertTriangle className="h-3 w-3" />
      case 'customer_updated': return <Users className="h-3 w-3" />
      default: return <Database className="h-3 w-3" />
    }
  }
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'ingredient_updated': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'recipe_updated': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      case 'order_created': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'stock_consumed': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      case 'customer_updated': return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
    }
  }
  
  const recentEvents = syncEvents.slice(-5).reverse()
  
  // Calculate sync health
  const criticalIngredients = ingredients.filter(ing => ing.statusStok === 'habis').length
  const unavailableRecipes = recipes.filter(recipe => {
    const availability = getRecipeAvailability(recipe)
    return !availability.available
  }).length
  
  if (!showDetailed) {
    // Compact sync indicator
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-500 dark:text-gray-500" />
          )}
          <span className="text-gray-600 dark:text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {syncEvents.length > 0 && (
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {syncEvents.length} events
            </span>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="h-7 px-2 text-xs"
        >
          {isSyncing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Sync Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Real-time Data Sync
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{ingredients.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Ingredients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{recipes.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{orders.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{syncEvents.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Sync Events</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last sync: {getTimeSinceLastSync()}</span>
            </div>
            {lastEventTime && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Last event: {getTimeSinceLastSync()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Health Alerts */}
      {(criticalIngredients > 0 || unavailableRecipes > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Sync Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalIngredients > 0 && (
              <Alert className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>{criticalIngredients} ingredients</strong> are out of stock - this affects recipe availability
                </AlertDescription>
              </Alert>
            )}
            
            {unavailableRecipes > 0 && (
              <Alert className="py-2">
                <Package className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>{unavailableRecipes} recipes</strong> are currently unavailable due to missing ingredients
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Sync Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Recent Sync Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent sync events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <Badge className={`text-xs ${getEventColor(event.type)}`}>
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{event.source}</span>
                    {event.payload && typeof event.payload === 'object' && (
                      <span className="ml-1">
                        {event.payload.id ? `(${event.payload.id})` : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Module Sync Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link className="h-4 w-4" />
            Cross-Module Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium">Inventory → Recipes</span>
                </div>
                <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium">Orders → Inventory</span>
                </div>
                <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium">Orders → Customers</span>
                </div>
                <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium">All → Reports</span>
                </div>
                <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Sync Features Active:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>✓ Stock consumption on orders</div>
              <div>✓ Recipe availability updates</div>
              <div>✓ Customer profile updates</div>
              <div>✓ Real-time report generation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Report Summary */}
      {reports.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Latest Report ({reports[0].periode})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  Rp {(reports[0].totalPendapatan / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {reports[0].totalPesanan}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Orders</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {reports[0].bahanKritis.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Critical Items</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {reports[0].marginRataRata.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Margin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RealTimeSyncDashboard