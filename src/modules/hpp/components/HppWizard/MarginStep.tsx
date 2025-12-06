'use client'

import { Percent } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface MarginStepProps {
  marginPercentage: number
  finalHpp: number
  finalPrice: number
  calculatedPrice: number
  onMarginChange: (margin: number) => void
}

export function MarginStep({
  marginPercentage,
  finalHpp,
  finalPrice,
  calculatedPrice,
  onMarginChange
}: MarginStepProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Percent className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Set Margin Keuntungan</h3>
            <p className="text-sm text-muted-foreground">
              Tentukan persentase margin yang diinginkan untuk produk ini
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="margin-slider">Margin Keuntungan: {marginPercentage}%</Label>
                <Input
                  id="margin-input"
                  type="number"
                  min="0"
                  max="200"
                  value={marginPercentage}
                  onChange={(e) => onMarginChange(Number(e.target.value) || 0)}
                  className="w-20"
                />
              </div>
              <Slider
                id="margin-slider"
                min={0}
                max={200}
                step={5}
                value={[marginPercentage]}
                onValueChange={(value) => { 
                  if (value.length > 0 && value[0] !== undefined) {
                    onMarginChange(value[0])
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
                <span>200%</span>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Total HPP:</span>
                <span className="font-medium">Rp {finalHpp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Margin ({marginPercentage}%):</span>
                <span className="font-medium">Rp {(finalPrice - finalHpp).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold">Harga Jual Rekomendasi:</span>
                <span className="font-bold text-primary">Rp {calculatedPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              💡 <strong>Rekomendasi:</strong> Margin 30-50% umumnya digunakan untuk bisnis kuliner. Margin di bawah 30% berisiko untuk sustainability.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
