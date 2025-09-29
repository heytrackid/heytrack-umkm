'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface InsightsTabProps {
  stats: {
    totalValue: number
  }
  analysis: any[]
  usageData: Record<string, number>
  ingredients: any[]
}

/**
 * Insights tab component showing smart insights and trends
 */
export function InsightsTab({ stats, analysis, usageData, ingredients }: InsightsTabProps) {
  const { formatCurrency } = useCurrency()
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Smart Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="font-medium text-blue-700 mb-1">Inventory Turnover</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Rata-rata inventory berputar setiap {Math.ceil(stats.totalValue / (Object.values(usageData).reduce((a, b) => a + b, 0) * 30 || 1))} hari
            </div>
          </div>

          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="font-medium text-green-700 mb-1">Optimization Potential</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {analysis.filter(a => a.status === 'overstocked').length} item overstocked,
              bisa hemat {formatCurrency(analysis.filter(a => a.status === 'overstocked').reduce((sum, a) => sum + ((a.ingredient.current_stock - a.ingredient.min_stock * 2) * a.ingredient.price_per_unit), 0))}
            </div>
          </div>

          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="font-medium text-yellow-700 mb-1">Cash Flow Impact</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Inventory mengikat {formatCurrency(stats.totalValue)} modal kerja
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Trends & Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(usageData).length > 0 ? (
            Object.entries(usageData).map(([ingredientId, usage]) => {
              const ingredient = ingredients.find(i => i.id === ingredientId)
              if (!ingredient) return null

              const dailyUsage = usage / 30
              const daysLeft = ingredient.current_stock / dailyUsage

              return (
                <div key={ingredientId} className="flex justify-between items-center text-sm">
                  <span>{ingredient.name}</span>
                  <div className="text-right">
                    <div className="font-medium">{usage.toFixed(1)} {ingredient.unit}/bulan</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(daysLeft)} hari lagi
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Belum ada data usage pattern</p>
              <p className="text-xs">Data akan tersedia setelah tracking produksi</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
