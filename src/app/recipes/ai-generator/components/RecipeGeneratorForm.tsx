// Recipe Generator Form Component - Lazy Loaded
// Input form for AI recipe generation parameters

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AlertCircle, ChefHat, Loader2, Sparkles } from 'lucide-react'
import type {
  AvailableIngredient
} from './types'

interface RecipeGeneratorFormProps {
  productName: string
  setProductName: (value: string) => void
  productType: string
  setProductType: (value: string) => void
  servings: number
  setServings: (value: number) => void
  targetPrice: string
  setTargetPrice: (value: string) => void
  dietaryRestrictions: string[]
  setDietaryRestrictions: (restrictions: string[]) => void
  selectedIngredients: string[]
  setSelectedIngredients: (ingredients: string[]) => void
  availableIngredients: AvailableIngredient[]
  loading: boolean
  onGenerate: () => void
  mode: 'complete' | 'quick'
}

export default function RecipeGeneratorForm({
  productName,
  setProductName,
  productType,
  setProductType,
  servings,
  setServings,
  targetPrice,
  setTargetPrice,
  dietaryRestrictions,
  setDietaryRestrictions,
  selectedIngredients,
  setSelectedIngredients,
  availableIngredients,
  loading,
  onGenerate
}: RecipeGeneratorFormProps) {
  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(
      dietaryRestrictions.includes(restriction)
        ? dietaryRestrictions.filter(r => r !== restriction)
        : [...dietaryRestrictions, restriction]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Detail Produk
        </CardTitle>
        <CardDescription>
          Isi informasi produk yang ingin kamu buat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="productName">Nama Produk *</Label>
          <Input
            id="productName"
            placeholder="Contoh: Roti Tawar Premium"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* Product Type */}
        <div className="space-y-2">
          <Label htmlFor="productType">Jenis Produk *</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: 'bread', label: 'Roti' },
                { value: 'cake', label: 'Kue' },
                { value: 'pastry', label: 'Pastry' },
                { value: 'cookies', label: 'Cookies' },
                { value: 'donuts', label: 'Donat' },
                { value: 'other', label: 'Lainnya' }
              ].map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Servings */}
        <div className="space-y-2">
          <Label htmlFor="servings">Jumlah Hasil (Servings) *</Label>
          <Input
            id="servings"
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">
            Berapa banyak unit yang dihasilkan dari resep ini
          </p>
        </div>

        {/* Target Price */}
        <div className="space-y-2">
          <Label htmlFor="targetPrice">Target Harga Jual (Optional)</Label>
          <Input
            id="targetPrice"
            type="number"
            placeholder="85000"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            AI akan optimize resep untuk mencapai margin yang sehat
          </p>
        </div>

        {/* Dietary Restrictions */}
        <div className="space-y-2">
          <Label>Dietary Restrictions (Optional)</Label>
          <div className="flex flex-wrap gap-2">
            {[
              'Halal',
              'Vegetarian',
              'Vegan',
              'Gluten-Free',
              'Dairy-Free',
              'Nut-Free'
            ].map(restriction => (
              <Badge
                key={restriction}
                variant={dietaryRestrictions.includes(restriction) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleDietaryRestriction(restriction)}
              >
                {restriction}
              </Badge>
            ))}
          </div>
        </div>

        {/* Preferred Ingredients */}
        <div className="space-y-2">
          <Label>Bahan yang Ingin Digunakan (Optional)</Label>
          <Textarea
            placeholder="Contoh: coklat premium, keju cheddar, kismis"
            value={selectedIngredients.join(', ')}
            onChange={(e) => setSelectedIngredients(
              e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            )}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Pisahkan dengan koma. AI akan prioritaskan bahan ini.
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={loading || !productName}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Magic...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Resep dengan AI
            </>
          )}
        </Button>

        {availableIngredients.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Belum ada bahan di inventory</p>
              <p className="mt-1">
                Tambahkan bahan baku dulu agar AI bisa generate resep yang akurat dengan perhitungan HPP.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
