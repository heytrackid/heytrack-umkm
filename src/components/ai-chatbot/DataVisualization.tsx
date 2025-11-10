'use client'

import { DollarSign } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

import type { Row } from '@/types/database'

type Customer = Row<'customers'>
type Recipe = Row<'recipes'>

// Dynamically import Recharts components to reduce bundle size
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell),
  { ssr: false }
)

interface ChartEntry {
  name: string
  value: number
  color: string
}

interface CustomerForViz extends Omit<Customer, 'total_orders' | 'total_spent'> {
  total_spent?: number
  total_orders?: number
}

interface RecipeForViz extends Omit<Recipe, 'times_made' | 'total_revenue'> {
  total_revenue?: number
  times_made?: number
}

interface InventoryItem {
  name: string
  current_stock: number
  unit: string
}

interface FinancialData {
  revenue: number
  costs: number
  profitMargin: number
}

interface InventoryData {
  criticalItems: InventoryItem[]
  alerts: unknown[]
  recommendations: string[]
}

interface CustomerData {
  topCustomers: CustomerForViz[]
  summary: string
}

interface ProductData {
  topRecipes: RecipeForViz[]
  recommendations: string[]
}

interface AnalysisData {
  analysis: {
    financial: FinancialData
    inventory: InventoryData
    recipes: ProductData
    customers: CustomerData
  }
}

interface DataVisualizationProps {
  type: 'analysis' | 'customers' | 'financial' | 'inventory' | 'products'
  data: unknown
  compact?: boolean
}

const FinancialChart = ({ data, compact = false, formatCurrency, colors }: {
  data: FinancialData
  compact?: boolean
  formatCurrency: (value: number) => string
  colors: string[]
}): JSX.Element => {
  const chartData: ChartEntry[] = useMemo(() => [
    { name: 'Revenue', value: data.revenue, color: colors[0] ?? '#10B981' },
    { name: 'Costs', value: data.costs, color: colors[1] ?? '#EF4444' },
    { name: 'Profit', value: data.revenue - data.costs, color: colors[2] ?? '#3B82F6' }
  ], [colors, data.costs, data.revenue])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-gray-600" />
          <span>Financial Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{formatCurrency(data.revenue)}</div>
              <div className="text-sm text-gray-500">Revenue</div>
            </div>
            <div>
              <div className="text-xl font-bold">{formatCurrency(data.costs)}</div>
              <div className="text-sm text-gray-500">Costs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-600">
                {formatCurrency(data.revenue - data.costs)}
              </div>
              <div className="text-sm text-gray-500">Profit</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-600">
                {data.profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Margin</div>
            </div>
          </div>

          {!compact && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `Rp${(value / 1_000_000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!compact && (
            <div className="space-y-2">
              <h4 className="font-medium">Key Insights</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Revenue is growing steadily with {data.profitMargin.toFixed(1)}% profit margin</li>
                <li>Consider optimizing costs to increase profitability</li>
                <li>Diversifying product offerings can boost revenue streams</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const InventoryChart = ({ data: _data, compact: _compact }: { data: InventoryData; compact?: boolean }): JSX.Element => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Inventory visualization</div></CardContent></Card>
)

const CustomerChart = ({ data: _data, compact: _compact }: { data: CustomerData; compact?: boolean }): JSX.Element => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Customer visualization</div></CardContent></Card>
)

const ProductChart = ({ data: _data, compact: _compact }: { data: ProductData; compact?: boolean }): JSX.Element => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Product visualization</div></CardContent></Card>
)

const AnalysisChart = ({ data: _data, compact: _compact }: { data: AnalysisData; compact?: boolean }): JSX.Element => (
  <Card><CardContent className="p-4"><div className="text-sm text-gray-500">Analysis visualization</div></CardContent></Card>
)

const DataVisualization = ({ type, data, compact = false }: DataVisualizationProps): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const isFinancialData = (value: unknown): value is FinancialData => {
    if (!value || typeof value !== 'object') { return false }
    return 'revenue' in value && 'costs' in value && 'profitMargin' in value
  }

  const isInventoryData = (value: unknown): value is InventoryData => {
    if (!value || typeof value !== 'object') { return false }
    return 'criticalItems' in value && 'alerts' in value && Array.isArray((value as InventoryData).criticalItems)
  }

  const isCustomerData = (value: unknown): value is CustomerData => {
    if (!value || typeof value !== 'object') { return false }
    return 'topCustomers' in value && 'summary' in value && Array.isArray((value as CustomerData).topCustomers)
  }

  const isProductData = (value: unknown): value is ProductData => {
    if (!value || typeof value !== 'object') { return false }
    return 'topRecipes' in value && 'recommendations' in value && Array.isArray((value as ProductData).topRecipes)
  }

  const isAnalysisData = (value: unknown): value is AnalysisData => {
    if (!value || typeof value !== 'object') { return false }
    return 'analysis' in value && typeof (value as AnalysisData).analysis === 'object'
  }

  switch (type) {
    case 'financial':
      if (isFinancialData(data)) {
        return <FinancialChart data={data} compact={compact} formatCurrency={formatCurrency} colors={colors} />
      }
      break
    case 'inventory':
      if (isInventoryData(data)) {
        return <InventoryChart data={data} compact={compact} />
      }
      break
    case 'customers':
      if (isCustomerData(data)) {
        return <CustomerChart data={data} compact={compact} />
      }
      break
    case 'products':
      if (isProductData(data)) {
        return <ProductChart data={data} compact={compact} />
      }
      break
    case 'analysis':
      if (isAnalysisData(data)) {
        return <AnalysisChart data={data} compact={compact} />
      }
      break
    default:
      break
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center text-gray-500">
          Data visualization not available for this type or data validation failed.
        </div>
      </CardContent>
    </Card>
  )
}

export { DataVisualization }