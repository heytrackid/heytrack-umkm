'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import HPPRecipeCard from './HPPRecipeCard'

interface HPPCalculatorTabProps {
  recipes: unknown[]
  formatCurrency: (amount: number) => string
  getMarginBadgeVariant: (margin: number) => 'default' | 'secondary' | 'destructive'
  getMarginStatus: (margin: number) => string
  isMobile?: boolean
}

export default function HPPCalculatorTab({
  recipes,
  formatCurrency,
  getMarginBadgeVariant,
  getMarginStatus,
  isMobile = false
}: HPPCalculatorTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-lg' : ''}>Kalkulator HPP Otomatis</CardTitle>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Analisa margin keuntungan untuk setiap produk berdasarkan komposisi bahan dan biaya operasional
          </p>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            {recipes.map(recipe => (
              <HPPRecipeCard
                key={recipe.id}
                recipe={recipe}
                formatCurrency={formatCurrency}
                getMarginBadgeVariant={getMarginBadgeVariant}
                getMarginStatus={getMarginStatus}
                isMobile={isMobile}
              />
            ))}
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
  )
}
