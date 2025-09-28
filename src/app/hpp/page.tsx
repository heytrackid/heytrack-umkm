'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/use-mobile'
import { useHPPCalculations } from '@/hooks/useDatabase'
import { AlertTriangle, RefreshCw, Calculator, TrendingUp } from 'lucide-react'

export default function HPPCalculatorPage() {
  const { isMobile } = useResponsive()
  const { recipes, loading, calculateHPP } = useHPPCalculations()

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              HPP Calculator
            </h1>
            <p className="text-muted-foreground">
              Hitung Harga Pokok Produksi (HPP) untuk setiap produk dengan otomatis
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className={`${isMobile ? 'text-sm' : ''}`}>Memuat data resep dan bahan...</span>
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
              HPP Calculator
            </h1>
            <p className="text-muted-foreground">
              Hitung Harga Pokok Produksi (HPP) untuk setiap produk dengan otomatis
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
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
            {/* Summary Stats */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {recipes.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Resep</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {recipes.filter(r => r.margin > 30).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Margin {'>'} 30%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={`font-bold text-amber-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {recipes.filter(r => r.margin >= 15 && r.margin <= 30).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Margin 15-30%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={`font-bold text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                      {recipes.filter(r => r.margin < 15).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Margin {'<'} 15%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* HPP Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className={isMobile ? 'text-lg' : ''}>Kalkulator HPP Otomatis</CardTitle>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                  Analisa margin keuntungan untuk setiap produk berdasarkan komposisi bahan dan biaya operasional
                </p>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                  {recipes.map(recipe => {
                    const ingredients = recipe.recipe_ingredients?.map((ri: any) => ri.ingredient?.name).filter(Boolean) || []
                    
                    return (
                      <Card key={recipe.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{recipe.name}</h3>
                                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  Bahan: {ingredients.length > 0 ? ingredients.join(', ') : 'Tidak ada data bahan'}
                                </p>
                                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  Kategori: {recipe.category}
                                </p>
                              </div>
                              <Badge variant={recipe.margin > 30 ? 'default' : recipe.margin > 15 ? 'secondary' : 'destructive'}>
                                {recipe.margin.toFixed(1)}% margin
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">HPP:</span>
                                  <span className="font-medium">Rp {Math.round(recipe.hpp).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">Harga Jual:</span>
                                  <span className="font-medium">Rp {(recipe.selling_price || 0).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">Keuntungan:</span>
                                  <span className="font-medium text-green-600">
                                    Rp {Math.round(recipe.profit).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">Status:</span>
                                  <Badge variant={recipe.margin > 30 ? 'default' : recipe.margin > 15 ? 'secondary' : 'destructive'} className="text-xs">
                                    {recipe.margin > 30 ? 'Sangat Baik' : recipe.margin > 15 ? 'Cukup Baik' : 'Perlu Review'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Tips Optimasi HPP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
              <div className="space-y-3">
                <h3 className="font-medium text-green-600">✅ HPP Ideal (Margin {'>'}30%)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Efisiensi bahan baku tinggi</li>
                  <li>• Harga jual kompetitif</li>
                  <li>• Profit margin sehat</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-red-600">⚠️ HPP Perlu Review (Margin {'<'}15%)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cek harga bahan baku</li>
                  <li>• Optimasi takaran resep</li>
                  <li>• Pertimbangkan naik harga</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}