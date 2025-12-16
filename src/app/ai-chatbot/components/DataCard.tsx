'use client'

import { TrendingUp, TrendingDown, Package, ShoppingCart, AlertCircle, DollarSign, ChevronDown, ChevronUp, ExternalLink, Eye } from '@/components/icons'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DataCardProps {
  title: string
  data: Record<string, unknown>
  type: 'inventory' | 'orders' | 'profit' | 'recipes'
}

const renderOrdersCard = (title: string, data: Record<string, unknown>, isExpanded: boolean, onToggleExpanded: () => void): JSX.Element => {
  const ordersData = data as { total: number; pending?: number; revenue?: number }

  return (
    <Card className="mt-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover: transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span>{title}</span>
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open('/orders', '_blank')}
              title="Lihat Detail Pesanan"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total Pesanan</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">{ordersData.total}</Badge>
        </div>
        {ordersData.pending !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Pending</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              {ordersData.pending}
            </Badge>
          </div>
        )}
        {ordersData.revenue !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Revenue</span>
            <span className="text-sm font-semibold text-green-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ordersData.revenue)}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        {isExpanded && (
          <div className="pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Aksi Cepat:</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/orders/new', '_blank')}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Pesanan Baru
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/orders', '_blank')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Lihat Semua
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const renderInventoryCard = (title: string, data: Record<string, unknown>, isExpanded: boolean, onToggleExpanded: () => void): JSX.Element => {
  const inventoryData = data as { critical: Array<{ name: string; stock: number; unit: string }> }
  const {critical} = inventoryData

  return (
    <Card className="mt-3 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900 border-orange-200 dark:border-orange-800 hover: transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span>{title}</span>
            <Badge variant="destructive" className="text-xs ml-2">
              {critical.length}
            </Badge>
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open('/ingredients', '_blank')}
              title="Kelola Inventori"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {critical.slice(0, isExpanded ? critical.length : 3).map((item) => (
          <div key={`critical-${item.name}`} className="flex justify-between items-center text-xs p-2 rounded bg-white/50 dark:bg-black/20">
            <span className="font-medium">{item.name}</span>
            <Badge variant="destructive" className="text-xs">
              {item.stock} {item.unit}
            </Badge>
          </div>
        ))}

        {!isExpanded && critical.length > 3 && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {isExpanded && (
          <div className="pt-3 border-t border-orange-200 dark:border-orange-700 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Aksi Cepat:</div>
            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/ingredients', '_blank')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Lihat Semua
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const renderProfitCard = (title: string, data: Record<string, unknown>, isExpanded: boolean, onToggleExpanded: () => void): JSX.Element => {
  const profitData = data as { margin: number; total_profit?: number }
  const isPositive = profitData.margin > 0

  return (
    <Card className="mt-3 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-emerald-200 dark:border-emerald-800 hover: transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>{title}</span>
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open('/profit', '_blank')}
              title="Lihat Laporan Profit"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Profit Margin</span>
          <Badge variant={isPositive ? "default" : "destructive"} className={`gap-1 ${isPositive ? 'bg-emerald-100 text-emerald-800' : ''}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{profitData.margin}%</span>
          </Badge>
        </div>
        {profitData.total_profit !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Profit</span>
            <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profitData.total_profit)}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        {isExpanded && (
          <div className="pt-3 border-t border-emerald-200 dark:border-emerald-700 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Aksi Cepat:</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/hpp', '_blank')}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analisis HPP
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/profit', '_blank')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Laporan Lengkap
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const renderRecipesCard = (title: string, data: Record<string, unknown>, isExpanded: boolean, onToggleExpanded: () => void): JSX.Element => {
  const recipes = data['top_recipes'] as Array<{ name: string; orders: number }>

  return (
    <Card className="mt-3 bg-gradient-to-br from-pink-50 to-purple-100 dark:from-pink-950 dark:to-purple-900 border-pink-200 dark:border-pink-800 hover: transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-pink-600" />
            <span>{title}</span>
          </CardTitle>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open('/recipes', '_blank')}
              title="Kelola Resep"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recipes.slice(0, isExpanded ? recipes.length : 3).map((recipe) => (
          <div key={`recipe-${recipe.name}`} className="flex justify-between items-center text-xs p-2 rounded bg-white/50 dark:bg-black/20">
            <span className="font-medium">{recipe.name}</span>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800">{recipe.orders}x dipesan</Badge>
          </div>
        ))}

        {!isExpanded && recipes.length > 3 && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => onToggleExpanded()}
            >
              Lihat {recipes.length - 3} lagi
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {isExpanded && (
          <div className="pt-3 border-t border-pink-200 dark:border-pink-700 space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Aksi Cepat:</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/recipes/new', '_blank')}
              >
                <Package className="h-3 w-3 mr-1" />
                Resep Baru
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => window.open('/recipes', '_blank')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Lihat Semua
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const getCardRenderer = (type: DataCardProps['type']): ((title: string, data: Record<string, unknown>, isExpanded: boolean, onToggleExpanded: () => void) => React.JSX.Element) | null => {
  switch (type) {
    case 'orders': return renderOrdersCard
    case 'inventory': return renderInventoryCard
    case 'profit': return renderProfitCard
    case 'recipes': return renderRecipesCard
    default: return null
  }
}

const validateDataForType = (data: Record<string, unknown>, type: DataCardProps['type']): boolean => {
  switch (type) {
    case 'orders': return 'total' in data && data['total'] !== null && typeof data['total'] === 'number'
    case 'inventory': return 'critical' in data && data['critical'] !== null
    case 'profit': return 'margin' in data && data['margin'] !== null && typeof data['margin'] === 'number'
    case 'recipes': return 'top_recipes' in data && data['top_recipes'] !== null
    default: return false
  }
}

export const DataCard = ({ title, data, type }: DataCardProps): JSX.Element | null => {
  const [isExpanded, setIsExpanded] = useState(false)
  const renderer = getCardRenderer(type)
  if (!renderer || !validateDataForType(data, type)) {
    return null
  }
  return renderer(title, data, isExpanded, () => setIsExpanded(!isExpanded))
}
