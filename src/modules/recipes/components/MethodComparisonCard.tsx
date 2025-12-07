'use client'

import { Calculator } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { HPPCalculationResult } from '@/modules/recipes/types/index'

interface WACInfoCardProps {
  calculationResult: HPPCalculationResult
  formatCurrency: (amount: number) => string
}

/**
 * WAC calculation info card component
 */
export const WACInfoCard = ({ calculationResult, formatCurrency }: WACInfoCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calculator className="h-5 w-5" />
        Perhitungan HPP (WAC)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* WAC Method Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span>📦</span>
            <span className="font-medium text-blue-800">WAC (Weighted Average Cost)</span>
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Aktif</Badge>
          </div>
          <p className="text-sm text-blue-700">
            Sistem menggunakan metode WAC untuk menghitung biaya bahan baku yang paling akurat
          </p>
        </div>

        {/* Current Calculation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(calculationResult.calculations.hppPerUnit)}
            </div>
            <div className="text-xs text-muted-foreground">HPP per Unit</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculationResult.calculations.suggestedSellingPrice)}
            </div>
            <div className="text-xs text-muted-foreground">Harga Jual Rekomendasi</div>
          </div>
        </div>

        {/* Margin Info */}
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-green-800">
            Margin Keuntungan: {calculationResult.calculations.profitMarginPercent}%
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)


