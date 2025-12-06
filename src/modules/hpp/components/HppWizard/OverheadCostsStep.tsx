'use client'

import { Factory } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { OverheadCosts } from './types'

interface OverheadCostsStepProps {
  overheadCosts: OverheadCosts
  totalOverhead: number
  onOverheadChange: (costs: OverheadCosts) => void
}

export function OverheadCostsStep({
  overheadCosts,
  totalOverhead,
  onOverheadChange
}: OverheadCostsStepProps) {
  const handleCostChange = (field: keyof OverheadCosts, value: string) => {
    onOverheadChange({
      ...overheadCosts,
      [field]: Number(value) || 0
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Factory className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Biaya Tambahan</h3>
            <p className="text-sm text-muted-foreground">
              Input biaya overhead dan operasional selain bahan baku
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="labor-cost">Biaya Tenaga Kerja (per porsi)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  id="labor-cost"
                  type="number"
                  placeholder="0"
                  value={overheadCosts.labor || ''}
                  onChange={(e) => handleCostChange('labor', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operational-cost">Biaya Operasional (per porsi)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  id="operational-cost"
                  type="number"
                  placeholder="0"
                  value={overheadCosts.operational || ''}
                  onChange={(e) => handleCostChange('operational', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packaging-cost">Biaya Packaging (per porsi)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  id="packaging-cost"
                  type="number"
                  placeholder="0"
                  value={overheadCosts.packaging || ''}
                  onChange={(e) => handleCostChange('packaging', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-cost">Biaya Lainnya (per porsi)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  id="other-cost"
                  type="number"
                  placeholder="0"
                  value={overheadCosts.other || ''}
                  onChange={(e) => handleCostChange('other', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Biaya Overhead:</span>
              <span className="font-bold text-primary">Rp {totalOverhead.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
