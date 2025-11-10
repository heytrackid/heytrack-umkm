'use client'

import { BarChart3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { HPPCalculationResult, PricingMethod } from '@/modules/recipes/types/index'





// Method descriptions for UMKM
const getPricingMethodDescription = (method: PricingMethod) => {
  const descriptions = {
    'list_price': {
      name: 'Harga List Tetap',
      description: 'Pakai harga yang sudah ditulis di daftar, tidak berubah',
      icon: '📋'
    },
    'weighted': {
      name: 'Rata-rata Tertimbang',
      description: 'Hitung rata-rata dari semua pembelian, yang banyak lebih berpengaruh',
      icon: '⚖️'
    },
    'fifo': {
      name: 'FIFO (Masuk Pertama Keluar Pertama)',
      description: 'Bahan yang dibeli duluan dipakai duluan, seperti di warung',
      icon: '📦'
    },
    'moving': {
      name: 'Rata-rata Bergerak',
      description: 'Harga rata-rata yang selalu update setiap beli bahan baru',
      icon: '📈'
    },
    'latest': {
      name: 'Harga Terakhir',
      description: 'Pakai harga dari pembelian paling baru',
      icon: '🆕'
    }
  }
  return descriptions[method] || descriptions['list_price']
}

interface MethodComparisonCardProps {
  calculationResult: HPPCalculationResult
  formatCurrency: (amount: number) => string
  selectedPricingMethod: PricingMethod
}

/**
 * Pricing method comparison card component
 */
export const MethodComparisonCard = ({ calculationResult, formatCurrency, selectedPricingMethod }: MethodComparisonCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Perbandingan Metode Harga
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {calculationResult.pricingAlternatives.map((alternative) => {
          const methodDesc = getPricingMethodDescription(alternative.method)
          return (
            <div
              key={alternative.method}
              className={`flex items-center justify-between p-3 rounded-lg border ${alternative.method === selectedPricingMethod
                ? 'border-border/20 bg-muted'
                : 'border-border/20'
                }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{methodDesc.icon}</span>
                  <span className="font-medium">
                    {methodDesc.name}
                  </span>
                  {alternative.method === selectedPricingMethod && (
                    <Badge variant="default" className="text-xs">Dipilih</Badge>
                  )}
                  {alternative.method === 'moving' && alternative.method !== selectedPricingMethod && (
                    <Badge variant="secondary" className="text-xs">Rekomendasi</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {alternative.methodDescription}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(alternative.costPerUnit)}
                </p>
                <p className="text-xs text-muted">per porsi</p>
              </div>
            </div>
          )
        })}
      </div>
    </CardContent>
  </Card>
)


