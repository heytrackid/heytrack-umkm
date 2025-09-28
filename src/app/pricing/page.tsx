'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'

export default function PricingCalculatorPage() {
  const { isMobile } = useResponsive()
  
  const [targetMargin, setTargetMargin] = useState(40)
  const [productCost, setProductCost] = useState(15000)
  const [recommendedPrice, setRecommendedPrice] = useState(0)

  useEffect(() => {
    const price = productCost / (1 - targetMargin / 100)
    setRecommendedPrice(Math.round(price))
  }, [productCost, targetMargin])

  const marginCategories = [
    { range: '20-30%', label: 'Margin Minimum', color: 'destructive', desc: 'Hanya untuk cover biaya' },
    { range: '30-50%', label: 'Margin Sehat', color: 'secondary', desc: 'Standard industri' },
    { range: '50-70%', label: 'Margin Optimal', color: 'default', desc: 'Keuntungan maksimal' },
    { range: '>70%', label: 'Margin Premium', color: 'default', desc: 'Produk eksklusif' },
  ]

  const presetProducts = [
    { name: 'Roti Tawar', cost: 15000, suggestedMargin: 40 },
    { name: 'Croissant', cost: 8000, suggestedMargin: 50 },
    { name: 'Donat', cost: 6000, suggestedMargin: 60 },
    { name: 'Kue Ulang Tahun', cost: 50000, suggestedMargin: 70 },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`${isMobile ? 'text-center' : ''}`}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Target Harga
          </h1>
          <p className="text-muted-foreground">
            Tentukan harga jual berdasarkan target margin keuntungan
          </p>
        </div>

        {/* Main Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Kalkulator Target Harga</CardTitle>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Masukkan HPP dan target margin untuk mendapatkan harga jual yang optimal
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
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Quick Preset */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Preset Produk Populer</CardTitle>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Klik untuk menggunakan data preset sesuai jenis produk
            </p>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              {presetProducts.map((product, index) => {
                const presetPrice = product.cost / (1 - product.suggestedMargin / 100)
                return (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:bg-muted/50 border-2 transition-colors"
                    onClick={() => {
                      setProductCost(product.cost)
                      setTargetMargin(product.suggestedMargin)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">HPP:</span>
                            <span>Rp {product.cost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Margin:</span>
                            <span>{product.suggestedMargin}%</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-muted-foreground">Harga:</span>
                            <span>Rp {Math.round(presetPrice).toLocaleString()}</span>
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
      </div>
    </AppLayout>
  )
}