'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign } from 'lucide-react'
import type { HPPCalculationResult } from '../services/EnhancedHPPCalculationService'
import { UMKMTooltip } from './UMKMTooltip'

interface MainResultsCardProps {
  calculationResult: HPPCalculationResult
  formatCurrency: (amount: number) => string
}

/**
 * Main calculation results card component
 */
export function MainResultsCard({ calculationResult, formatCurrency }: MainResultsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Hasil Perhitungan HPP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <UMKMTooltip
              title="HPP Per Porsi"
              content="Berapa biaya untuk membuat 1 porsi produk. Ini adalah cost minimum sebelum profit."
            >
              <p className="text-sm text-gray-600">HPP Per Porsi</p>
            </UMKMTooltip>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(calculationResult.calculations.hppPerUnit)}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <UMKMTooltip
              title="Harga Jual Saran"
              content="Harga jual yang disarankan sudah termasuk target keuntungan Anda."
            >
              <p className="text-sm text-gray-600">Harga Jual Saran</p>
            </UMKMTooltip>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(calculationResult.calculations.suggestedSellingPrice)}
            </p>
            <Badge variant="secondary" className="mt-1 text-xs">
             {calculationResult.calculations.profitMarginPercent}% profit
            </Badge>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <UMKMTooltip
              title="Total HPP"
              content="Total biaya untuk membuat seluruh batch resep ini."
            >
              <p className="text-sm text-gray-600">Total HPP</p>
            </UMKMTooltip>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(calculationResult.calculations.totalHPP)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {calculationResult.servings} porsi
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <UMKMTooltip
              title="Profit Per Porsi"
              content="Keuntungan bersih yang Anda dapat dari setiap porsi yang terjual."
            >
              <p className="text-sm text-gray-600">Profit Per Porsi</p>
            </UMKMTooltip>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(
                calculationResult.calculations.suggestedSellingPrice -
                calculationResult.calculations.hppPerUnit
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
