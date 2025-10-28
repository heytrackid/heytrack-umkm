'use client'

import { Card, CardContent } from '@/components/ui/card'
// import { Receipt, Zap, RefreshCw } from 'lucide-react'

interface CostStatsProps {
  totalCosts: number
  fixedCosts: number
  totalMonthly: number
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

/**
 * Cost Statistics Component
 * Shows summary stats for operational costs
 */
export default function CostStats({
  totalCosts,
  fixedCosts,
  totalMonthly,
  formatCurrency,
  isMobile = false
}: CostStatsProps) {
  const variableCosts = totalCosts - fixedCosts

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
      <Card>
        <CardContent className="p-4 text-center">
          <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalCosts}</div>
          <p className="text-sm text-muted-foreground">Total Biaya</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Zap className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{fixedCosts}</div>
          <p className="text-sm text-muted-foreground">Biaya Tetap</p>
          {variableCosts > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{variableCosts} variabel</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div>
          <p className="text-sm text-muted-foreground">Total/Bulan</p>
        </CardContent>
      </Card>
    </div>
  )
}
