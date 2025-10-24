'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Target } from 'lucide-react'

interface PricingStrategyTabProps {
  recipes: unknown[]
  selectedRecipe: unknown
  selectedRecipeId: string
  setSelectedRecipeId: (id: string) => void
  targetMargin: number
  setTargetMargin: (margin: number) => void
  productCost: number
  setProductCost: (cost: number) => void
  recommendedPrice: number
  isUpdating: boolean
  marginCategories: Array<{ range: string; label: string; color: string; desc: string }>
  handleUpdateRecipePrice: () => void
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

export default function PricingStrategyTab({
  recipes,
  selectedRecipe,
  selectedRecipeId,
  setSelectedRecipeId,
  targetMargin,
  setTargetMargin,
  productCost,
  setProductCost,
  recommendedPrice,
  isUpdating,
  marginCategories,
  handleUpdateRecipePrice,
  formatCurrency,
  isMobile = false
}: PricingStrategyTabProps) {
  return (
    <div className="space-y-6">
      {/* Recipe Selector */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-lg' : ''}>Pilih Resep untuk Dihitung</CardTitle>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Pilih resep yang ingin dihitung target harga jualnya
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Pilih Resep</Label>
              <Select value={selectedRecipeId} onValueChange={(value) => {
                if (value !== 'placeholder') {
                  setSelectedRecipeId(value)
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    Pilih resep untuk kalkulasi harga
                  </SelectItem>
                  {recipes.map(recipe => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name} - HPP: {formatCurrency(Math.round(recipe.hpp))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedRecipe && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">{selectedRecipe.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kategori:</span>
                    <span className="ml-2">{selectedRecipe.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">HPP Saat Ini:</span>
                    <span className="ml-2 font-medium">{formatCurrency(Math.round(selectedRecipe.hpp))}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Harga Jual Saat Ini:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedRecipe.selling_price || 0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Margin Saat Ini:</span>
                    <span className="ml-2 font-medium">{selectedRecipe.margin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Calculator */}
      {selectedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Kalkulator Target Harga</CardTitle>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Tentukan target margin untuk menghitung harga jual yang optimal
            </p>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cost">HPP Produk</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={productCost}
                    onChange={(e) => setProductCost(parseFloat(e.target.value) || 0)}

                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total biaya bahan baku + operasional
                  </p>
                </div>
                <div>
                  <Label htmlFor="margin">Target Margin (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value) || 0)}

                    min="0"
                    max="100"
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Persentase keuntungan yang diinginkan
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Harga Jual Rekomendasi</p>
                        <p className={`font-bold text-primary ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                          {formatCurrency(recommendedPrice)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">HPP</p>
                          <p className="font-medium">{formatCurrency(productCost)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Keuntungan</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(recommendedPrice - productCost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status Margin:</p>
                  <Badge 
                    variant={
                      targetMargin < 30 ? 'destructive' : 
                      targetMargin < 50 ? 'secondary' : 
                      'default'
                    }
                    className="w-full justify-center py-2"
                  >
                    {targetMargin < 30 ? 'Margin Minimum' :
                     targetMargin < 50 ? 'Margin Sehat' :
                     targetMargin < 70 ? 'Margin Optimal' : 'Margin Premium'}
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleUpdateRecipePrice}
                  disabled={isUpdating}
                  className={isMobile ? 'w-full' : ''}
                >
                  {isUpdating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  {isUpdating ? 'Mengupdate...' : 'Update Harga Resep'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Margin Guide */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-lg' : ''}>Panduan Margin Keuntungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {marginCategories.map((category, index: number) => (
              <Card key={index} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant={category.color as 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'} className="w-full justify-center">
                      {category.range}
                    </Badge>
                    <h3 className="font-medium text-center">{category.label}</h3>
                    <p className="text-xs text-muted-foreground text-center">
                      {category.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
