'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResponsive } from '@/hooks/use-mobile'
import { useHPPCalculations, useRecipes } from '@/hooks/useDatabase'
import { RefreshCw, Target, Calculator } from 'lucide-react'

export default function PricingCalculatorPage() {
  const { isMobile } = useResponsive()
  const { recipes, loading } = useHPPCalculations()
  const { update: updateRecipe } = useRecipes()
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  const [targetMargin, setTargetMargin] = useState(40)
  const [productCost, setProductCost] = useState(0)
  const [recommendedPrice, setRecommendedPrice] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

  // Update product cost when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      setProductCost(Math.round(selectedRecipe.hpp))
      setTargetMargin(selectedRecipe.margin || 40)
    }
  }, [selectedRecipe])

  // Calculate recommended price
  useEffect(() => {
    if (productCost > 0) {
      const price = productCost / (1 - targetMargin / 100)
      setRecommendedPrice(Math.round(price))
    }
  }, [productCost, targetMargin])

  const handleUpdateRecipePrice = async () => {
    if (!selectedRecipeId || recommendedPrice <= 0) return
    
    try {
      setIsUpdating(true)
      await updateRecipe(selectedRecipeId, {
        selling_price: recommendedPrice,
        margin_percentage: targetMargin,
        updated_at: new Date().toISOString(),
      })
      
      // Show success (you can add toast notification here)
      alert('Harga berhasil diupdate!')
    } catch (error) {
      console.error('Error updating recipe:', error)
      alert('Gagal update harga')
    } finally {
      setIsUpdating(false)
    }
  }

  const marginCategories = [
    { range: '20-30%', label: 'Margin Minimum', color: 'destructive', desc: 'Hanya untuk cover biaya' },
    { range: '30-50%', label: 'Margin Sehat', color: 'secondary', desc: 'Standard industri' },
    { range: '50-70%', label: 'Margin Optimal', color: 'default', desc: 'Keuntungan maksimal' },
    { range: '>70%', label: 'Margin Premium', color: 'default', desc: 'Produk eksklusif' },
  ]

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Target Harga
            </h1>
            <p className="text-muted-foreground">
              Tentukan harga jual berdasarkan target margin keuntungan
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className={`${isMobile ? 'text-sm' : ''}`}>Memuat data resep...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Target Harga
            </h1>
            <p className="text-muted-foreground">
              Tentukan harga jual berdasarkan target margin keuntungan
            </p>
          </div>
          <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {recipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Belum ada data resep
              </h3>
              <p className="text-muted-foreground mb-4">
                Silakan tambahkan resep terlebih dahulu di halaman Produksi
              </p>
              <Button onClick={() => window.location.href = '/production'}>
                Ke Halaman Produksi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
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
                  <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih resep untuk kalkulasi harga" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map(recipe => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name} - HPP: Rp {Math.round(recipe.hpp).toLocaleString()}
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
                        <span className="ml-2 font-medium">Rp {Math.round(selectedRecipe.hpp).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Harga Jual Saat Ini:</span>
                        <span className="ml-2 font-medium">Rp {(selectedRecipe.selling_price || 0).toLocaleString()}</span>
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
                      <Label htmlFor="cost">HPP Produk (Rp)</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={productCost}
                        onChange={(e) => setProductCost(Number(e.target.value) || 0)}
                        placeholder="15000"
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
                        placeholder="40"
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
                              Rp {recommendedPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">HPP</p>
                              <p className="font-medium">Rp {productCost.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Keuntungan</p>
                              <p className="font-medium text-green-600">
                                Rp {(recommendedPrice - productCost).toLocaleString()}
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
                {marginCategories.map((category, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Badge variant={category.color as any} className="w-full justify-center">
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
          </>
        )}
      </div>
    </AppLayout>
  )
}