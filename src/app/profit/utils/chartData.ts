/**
 * Profit Report Utilities
 * Utility functions for profit report data processing
 */

import { useMemo } from 'react'
import type { ProfitData, ProductChartData } from '@/app/profit/components/types'

export function useProductChartData(profitData: ProfitData | null): ProductChartData[] {
  return useMemo(() => {
    if (!profitData?.products || profitData.products.length === 0) {
      return []
    }

    return profitData.products
      .slice(0, 10) // Top 10 products
      .map(product => ({
        name: product.product_name.length > 15
          ? `${product.product_name.substring(0, 15)  }...`
          : product.product_name,
        revenue: product.revenue,
        cogs: product.cogs,
        profit: product.profit
      }))
  }, [profitData])
}

export function formatCurrencyAmount(value: number): string {
  if (value >= 1000000) {return `${(value / 1000000).toFixed(1)}jt`}
  if (value >= 1000) {return `${(value / 1000).toFixed(0)}rb`}
  return value.toString()
}
