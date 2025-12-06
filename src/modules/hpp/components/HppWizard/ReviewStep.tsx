'use client'

import { Calculator, DollarSign } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { OverheadCosts } from './types'

interface HppRecipeData {
  id: string
  name: string
  servings: number
  total_cost: number | null
}

interface ReviewStepProps {
  recipe: HppRecipeData | null
  overheadCosts: OverheadCosts
  totalOverhead: number
  marginPercentage: number
  finalHpp: number
  finalPrice: number
  calculatedPrice: number
  isSaving: boolean
  onSave: () => void
}

export function ReviewStep({
  recipe,
  overheadCosts,
  totalOverhead,
  marginPercentage,
  finalHpp,
  finalPrice,
  calculatedPrice,
  isSaving,
  onSave
}: ReviewStepProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Calculator className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Review Hasil Kalkulasi</h3>
            <p className="text-sm text-muted-foreground">
              Periksa hasil perhitungan dan simpan kalkulasi
            </p>
          </div>

          {recipe && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan Kalkulasi HPP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Resep</h4>
                      <p className="text-sm text-muted-foreground">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">Untuk {recipe.servings} porsi</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Biaya Bahan Baku</h4>
                      <p className="text-sm font-medium">Rp {recipe.total_cost?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Biaya Tambahan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tenaga Kerja:</span>
                        <span>Rp {overheadCosts.labor.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operasional:</span>
                        <span>Rp {overheadCosts.operational.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Packaging:</span>
                        <span>Rp {overheadCosts.packaging.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lainnya:</span>
                        <span>Rp {overheadCosts.other.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Total Overhead:</span>
                        <span>Rp {totalOverhead.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Hasil Akhir</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total HPP:</span>
                        <span className="font-bold">Rp {finalHpp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin ({marginPercentage}%):</span>
                        <span>Rp {(finalPrice - finalHpp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between bg-primary/10 p-3 rounded-lg">
                        <span className="font-bold">Harga Jual:</span>
                        <span className="font-bold text-primary text-lg">Rp {calculatedPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={onSave}
                className="w-full"
                size="lg"
                disabled={isSaving}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : 'Simpan Kalkulasi HPP'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
