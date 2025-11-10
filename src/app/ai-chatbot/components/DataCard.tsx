import { TrendingUp, TrendingDown, Package, ShoppingCart, AlertCircle, DollarSign } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DataCardProps {
  title: string
  data: Record<string, unknown>
  type: 'inventory' | 'orders' | 'profit' | 'recipes'
}

const renderOrdersCard = (title: string, data: Record<string, unknown>): JSX.Element => {
  const ordersData = data as { total: number; pending?: number; revenue?: number }
  return (
    <Card className="mt-3 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total Pesanan</span>
          <Badge variant="secondary">{ordersData.total}</Badge>
        </div>
          {ordersData.pending !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Pending</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {ordersData.pending}
            </Badge>
          </div>
        )}
          {ordersData.revenue !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Revenue</span>
              <span className="text-sm font-semibold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ordersData.revenue)}
              </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const renderInventoryCard = (title: string, data: Record<string, unknown>): JSX.Element => {
  const inventoryData = data as { critical: Array<{ name: string; stock: number; unit: string }> }
  const {critical} = inventoryData
  return (
    <Card className="mt-3 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {critical.slice(0, 5).map((item) => (
          <div key={`critical-${item.name}`} className="flex justify-between items-center text-xs">
            <span className="font-medium">{item.name}</span>
            <Badge variant="destructive" className="text-xs">
              {item.stock} {item.unit}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const renderProfitCard = (title: string, data: Record<string, unknown>): JSX.Element => {
  const profitData = data as { margin: number; total_profit?: number }
  const isPositive = profitData.margin > 0
  return (
    <Card className="mt-3 bg-gradient-to-br from-gray-50 to-emerald-100 dark:from-gray-900 dark:to-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Profit Margin</span>
          <Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{profitData.margin}%</span>
          </Badge>
        </div>
          {profitData.total_profit !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Profit</span>
              <span className="text-sm font-semibold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profitData.total_profit)}
              </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const renderRecipesCard = (title: string, data: Record<string, unknown>): JSX.Element => {
  const recipes = data['top_recipes'] as Array<{ name: string; orders: number }>
  return (
    <Card className="mt-3 bg-gradient-to-br from-gray-50 to-pink-100 dark:from-gray-900 dark:to-pink-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recipes.slice(0, 5).map((recipe) => (
          <div key={`recipe-${recipe.name}`} className="flex justify-between items-center text-xs">
            <span className="font-medium">{recipe.name}</span>
            <Badge variant="secondary">{recipe.orders}x</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const getCardRenderer = (type: DataCardProps['type']): ((title: string, data: Record<string, unknown>) => React.JSX.Element) | null => {
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
  const renderer = getCardRenderer(type)
  if (!renderer || !validateDataForType(data, type)) {
    return null
  }
  return renderer(title, data)
}
