'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'

export default function HPPCalculatorPage() {
  const { isMobile } = useResponsive()
  
  const [recipes] = useState([
    { id: '1', name: 'Roti Tawar', ingredients: ['Tepung', 'Mentega', 'Gula'], cost: 15000, price: 25000 },
    { id: '2', name: 'Croissant', ingredients: ['Tepung', 'Mentega', 'Telur'], cost: 8000, price: 15000 },
    { id: '3', name: 'Donat Coklat', ingredients: ['Tepung', 'Mentega', 'Coklat', 'Gula'], cost: 12000, price: 20000 },
    { id: '4', name: 'Kue Cubit', ingredients: ['Tepung', 'Telur', 'Susu'], cost: 5000, price: 10000 },
  ])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`${isMobile ? 'text-center' : ''}`}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            HPP Calculator
          </h1>
          <p className="text-muted-foreground">
            Hitung Harga Pokok Produksi (HPP) untuk setiap produk dengan otomatis
          </p>
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
                const margin = ((recipe.price - recipe.cost) / recipe.price * 100)
                const profit = recipe.price - recipe.cost
                
                return (
                  <Card key={recipe.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{recipe.name}</h3>
                            <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              Bahan: {recipe.ingredients.join(', ')}
                            </p>
                          </div>
                          <Badge variant={margin > 30 ? 'default' : margin > 15 ? 'secondary' : 'destructive'}>
                            {margin.toFixed(1)}% margin
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-sm">HPP:</span>
                              <span className="font-medium">Rp {recipe.cost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-sm">Harga Jual:</span>
                              <span className="font-medium">Rp {recipe.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-sm">Keuntungan:</span>
                              <span className="font-medium text-green-600">
                                Rp {profit.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-sm">Status:</span>
                              <Badge variant={margin > 30 ? 'default' : margin > 15 ? 'secondary' : 'destructive'} className="text-xs">
                                {margin > 30 ? 'Sangat Baik' : margin > 15 ? 'Cukup Baik' : 'Perlu Review'}
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