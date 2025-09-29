import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShoppingCart,
  Clock,
  Target,
  Zap,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Truck
} from 'lucide-react'

interface SmartIngredientItem {
  id: string
  nama: string
  stok: number
  satuan: string
  harga: number
  stokMinimal: number
  total: number
  statusStok: 'aman' | 'rendah' | 'habis'
  
  // Smart features
  averageUsage: number        // Per week
  usageHistory: number[]      // Last 4 weeks
  demandForecast: number      // Next week prediction
  reorderPoint: number
  reorderQuantity: number
  leadTime: number            // Days to get new stock
  volatility: 'low' | 'medium' | 'high'
  alternatives: string[]
  seasonality: boolean
  supplierReliability: number // 0-100 score
  priceHistory: number[]      // Last 4 weeks prices
  
  // Smart recommendations
  actions: SmartAction[]
}

interface SmartAction {
  type: 'reorder' | 'reduce_usage' | 'find_alternative' | 'price_alert' | 'seasonal_prep'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: {
    costSaving?: number
    riskReduction?: number
    efficiency?: number
  }
  actionButton?: {
    label: string
    onClick: () => void
  }
}

interface SmartInventoryAutomationProps {
  items: SmartIngredientItem[]
  onReorder: (itemId: string, quantity: number) => void
  onUpdateItem: (itemId: string, updates: Partial<SmartIngredientItem>) => void
}

export function SmartInventoryAutomation({
  items,
  onReorder,
  onUpdateItem
}: SmartInventoryAutomationProps) {
  
  // Smart analytics
  const analytics = {
    criticalItems: items.filter(item => item.statusStok === 'habis' || item.actions.some(a => a.urgency === 'critical')).length,
    lowStockItems: items.filter(item => item.statusStok === 'rendah').length,
    highVolatilityItems: items.filter(item => item.volatility === 'high').length,
    totalValue: items.reduce((sum, item) => sum + item.total, 0),
    averageTurnover: items.reduce((sum, item) => sum + (item.averageUsage || 0), 0) / items.length,
    predictedShortfall: items.filter(item => item.demandForecast > item.stok).length
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-800'
      case 'high': return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900'
      case 'medium': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950'
      case 'low': return 'text-gray-500 dark:text-gray-500 bg-gray-25 dark:bg-gray-975'
      default: return 'text-gray-400 dark:text-gray-600 bg-gray-25 dark:bg-gray-975'
    }
  }

  const getVolatilityIcon = (volatility: string) => {
    switch (volatility) {
      case 'high': return <ArrowUpRight className="h-3 w-3 text-gray-600 dark:text-gray-400" />
      case 'medium': return <TrendingUp className="h-3 w-3 text-gray-500 dark:text-gray-500" />
      case 'low': return <TrendingDown className="h-3 w-3 text-gray-400 dark:text-gray-600" />
      default: return <Target className="h-3 w-3 text-gray-400 dark:text-gray-600" />
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'reorder': return <ShoppingCart className="h-4 w-4" />
      case 'reduce_usage': return <TrendingDown className="h-4 w-4" />
      case 'find_alternative': return <Target className="h-4 w-4" />
      case 'price_alert': return <DollarSign className="h-4 w-4" />
      case 'seasonal_prep': return <Calendar className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const calculateStockDays = (item: SmartIngredientItem) => {
    if (item.averageUsage === 0) return '∞'
    const daysLeft = (item.stok / (item.averageUsage / 7))
    return daysLeft < 1 ? '<1' : Math.ceil(daysLeft).toString()
  }

  const getSeasonalIndicator = (item: SmartIngredientItem) => {
    if (item.seasonality) {
      return <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-500">Musiman</Badge>
    }
    return null
  }

  // Priority actions (most urgent first)
  const priorityActions = items
    .flatMap(item => item.actions.map(action => ({ ...action, item })))
    .sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Smart Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Inventory Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{analytics.criticalItems}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Item Kritis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{analytics.lowStockItems}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Stok Rendah</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{analytics.highVolatilityItems}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Volatil Tinggi</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">Rp {(analytics.totalValue / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Nilai</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{analytics.averageTurnover.toFixed(1)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Turnover</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{analytics.predictedShortfall}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Diprediksi Kurang</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Aksi Prioritas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {priorityActions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Semua inventory dalam kondisi optimal!</p>
            </div>
          ) : (
            priorityActions.map((action, index) => (
              <Alert key={index} className="p-4">
                <div className="flex items-start gap-3">
                  {getActionIcon(action.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getUrgencyColor(action.urgency)}`}>
                          {action.urgency}
                        </Badge>
                        {action.item.volatility && getVolatilityIcon(action.item.volatility)}
                      </div>
                    </div>
                    <AlertDescription>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <strong>{action.item.nama}:</strong> {action.description}
                      </div>
                      {action.estimatedImpact && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                          Dampak: 
                          {action.estimatedImpact.costSaving && ` Hemat Rp ${action.estimatedImpact.costSaving.toLocaleString()}`}
                          {action.estimatedImpact.riskReduction && ` Risiko -${action.estimatedImpact.riskReduction}%`}
                          {action.estimatedImpact.efficiency && ` Efisiensi +${action.estimatedImpact.efficiency}%`}
                        </div>
                      )}
                      {action.actionButton && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-7 mt-2"
                          onClick={action.actionButton.onClick}
                        >
                          {action.actionButton.label}
                        </Button>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>

      {/* Smart Inventory Items */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.filter(item => item.actions.length > 0 || item.volatility === 'high' || item.statusStok !== 'aman').map((item) => (
          <Card key={item.id} className="hover: transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-sm">{item.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getVolatilityIcon(item.volatility)}
                  {getSeasonalIndicator(item)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Smart Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Sisa Hari</div>
                  <div className="font-medium">{calculateStockDays(item)} hari</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Prediksi Minggu Depan</div>
                  <div className="font-medium">{item.demandForecast.toFixed(1)} {item.satuan}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Lead Time</div>
                  <div className="font-medium">{item.leadTime} hari</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Supplier Score</div>
                  <div className="font-medium">{item.supplierReliability}%</div>
                </div>
              </div>

              {/* Demand Forecast Trend */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Trend Penggunaan (4 minggu)</span>
                  <span className="text-xs font-medium">{item.averageUsage.toFixed(1)}/minggu</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {item.usageHistory.map((usage, index) => {
                    const maxUsage = Math.max(...item.usageHistory)
                    const height = maxUsage > 0 ? (usage / maxUsage) * 100 : 0
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-sm"
                        style={{ height: `${height}%` }}
                        title={`Minggu ${index + 1}: ${usage} ${item.satuan}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Price Volatility */}
              {item.priceHistory && item.priceHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Volatilitas Harga</span>
                    <Badge className={`text-xs ${getVolatilityColor(item.volatility)}`}>
                      {item.volatility}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-1 h-6">
                    {item.priceHistory.map((price, index) => {
                      const maxPrice = Math.max(...item.priceHistory)
                      const minPrice = Math.min(...item.priceHistory)
                      const normalizedHeight = maxPrice > minPrice ? ((price - minPrice) / (maxPrice - minPrice)) * 100 : 50
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-gray-400 dark:bg-gray-600 rounded-sm"
                          style={{ height: `${Math.max(normalizedHeight, 10)}%` }}
                          title={`Minggu ${index + 1}: Rp ${price.toLocaleString()}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {item.alternatives.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alternatif:</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {item.alternatives.slice(0, 2).join(', ')}
                    {item.alternatives.length > 2 && ` +${item.alternatives.length - 2} lagi`}
                  </div>
                </div>
              )}

              {/* Smart Actions for this item */}
              {item.actions.slice(0, 2).map((action, actionIndex) => (
                <div key={actionIndex} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.title}</div>
                    <Badge className={`text-xs ${getUrgencyColor(action.urgency)}`}>
                      {action.urgency}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {action.description}
                  </div>
                  {action.type === 'reorder' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-6 w-full"
                      onClick={() => onReorder(item.id, item.reorderQuantity)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Pesan {item.reorderQuantity} {item.satuan}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supplier Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Insight Supplier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items
              .filter(item => item.supplierReliability < 90 || item.leadTime > 7)
              .slice(0, 6)
              .map((item) => (
                <div key={item.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{item.nama}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.supplierReliability}% reliable
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Lead time: {item.leadTime} hari
                  </div>
                  {item.supplierReliability < 80 && (
                    <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                      💡 Pertimbangkan supplier cadangan
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SmartInventoryAutomation