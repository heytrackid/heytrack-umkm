'use client'

import { Card, CardContent } from '@/components/ui/card'

interface HppPreviewCardProps {
  materialCost: number
  totalOverhead: number
  finalHpp: number
  finalPrice: number
  marginPercentage: number
  calculatedPrice: number
}

export function HppPreviewCard({
  materialCost,
  totalOverhead,
  finalHpp,
  finalPrice,
  marginPercentage,
  calculatedPrice
}: HppPreviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="font-semibold mb-4">Preview Kalkulasi</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Biaya Bahan Baku:</span>
            <span className="text-sm font-medium">Rp {materialCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Biaya Overhead:</span>
            <span className="text-sm font-medium">Rp {totalOverhead.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total HPP:</span>
              <span className="text-sm font-bold">Rp {finalHpp.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Margin ({marginPercentage}%):</span>
            <span className="text-sm font-medium">Rp {(finalPrice - finalHpp).toLocaleString()}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Harga Jual:</span>
              <span className="text-sm font-bold text-primary">Rp {calculatedPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
