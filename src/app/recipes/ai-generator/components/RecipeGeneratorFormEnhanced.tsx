'use client'


import { Sparkles, Info, ChefHat } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip'

import type { AvailableIngredient } from '@/app/recipes/ai-generator/components/types'

// Enhanced Recipe Generator Form with Quick/Complete Mode
// Improved UX with contextual placeholders and better guidance


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
  setDietaryRestrictions: (value: string[]) => void
  selectedIngredients: string[]
  setSelectedIngredients: (value: string[]) => void
  availableIngredients: AvailableIngredient[]
  loading: boolean
  onGenerate: () => void
  mode: 'complete' | 'quick'
}

const productTypes = [
  { value: 'bread', label: 'Roti', unit: 'loyang', example: '2 loyang' },
  { value: 'cake', label: 'Kue', unit: 'loyang', example: '1 loyang' },
  { value: 'pastry', label: 'Pastry', unit: 'potong', example: '12 potong' },
  { value: 'cookies', label: 'Cookies', unit: 'keping', example: '24 keping' },
  { value: 'donuts', label: 'Donat', unit: 'buah', example: '10 buah' },
  { value: 'other', label: 'Lainnya', unit: 'porsi', example: '5 porsi' },
]

const dietaryOptions = [
  { value: 'halal', label: 'Halal' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'no-dairy', label: 'Tanpa Susu' },
  { value: 'no-eggs', label: 'Tanpa Telur' },
  { value: 'gluten-free', label: 'Bebas Gluten' },
]

const RecipeGeneratorFormEnhanced = ({
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
  onGenerate,
  mode,
}: RecipeGeneratorFormProps) => {
  const currentProductType = productTypes.find(p => p.value === productType)
  const servingsLabel = currentProductType?.unit ?? 'porsi'
  const servingsExample = currentProductType?.example ?? '5 porsi'

  const toggleDietaryRestriction = (value: string) => {
    if (dietaryRestrictions.includes(value)) {
      setDietaryRestrictions(dietaryRestrictions.filter(d => d !== value))
    } else {
      setDietaryRestrictions([...dietaryRestrictions, value])
    }
  }

  const toggleIngredient = (ingredientName: string) => {
    if (selectedIngredients.includes(ingredientName)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredientName))
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientName])
    }
  }

  return (
    <Card>
      <CardHeader className="bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {mode === 'quick' ? '⚡ Input Cepat' : '🎯 Input Lengkap'}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === 'quick'
                ? 'Isi nama produk & jumlah, AI akan otomatis menyesuaikan resep'
                : 'Isi detail lengkap untuk hasil yang lebih akurat'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="productName">
            Nama Produk <span className="text-red-500">*</span>
          </Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
            placeholder="Contoh: Roti Tawar Premium, Brownies Coklat"
            disabled={loading}
          />
        </div>

        {/* Product Type */}
        <div className="space-y-2">
          <Label htmlFor="productType">
            Jenis Produk <span className="text-red-500">*</span>
          </Label>
          <Select value={productType} onValueChange={setProductType} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Servings with Dynamic Label */}
        <div className="space-y-2">
          <Label htmlFor="servings" className="flex items-center gap-2">
            Jumlah Hasil <span className="text-red-500">*</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contoh: {servingsExample}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <div className="flex gap-2">
            <Input
              id="servings"
              type="number"
              value={servings}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServings(parseInt(e.target.value) || 1)}
              min={1}
              disabled={loading}
              className="flex-1"
            />
            <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground min-w-[80px] flex items-center justify-center">
              {servingsLabel}
            </div>
          </div>
        </div>

        {/* Complete Mode Fields */}
        {mode === 'complete' && (
          <>
            {/* Target Price */}
            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="flex items-center gap-2">
                Target Harga Jual (opsional)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI akan menyesuaikan bahan agar HPP sekitar 40-50% dari harga jual</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2">
                <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
                  Rp
                </div>
                <Input
                  id="targetPrice"
                  type="number"
                  value={targetPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetPrice(e.target.value)}
                  placeholder="Contoh: 25000"
                  disabled={loading}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-2">
              <Label>Pembatasan Diet (opsional)</Label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={dietaryRestrictions.includes(option.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => !loading && toggleDietaryRestriction(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Ingredients */}
            <div className="space-y-2">
              <Label>Bahan yang Ingin Digunakan (opsional)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                {availableIngredients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada bahan tersedia. Tambahkan bahan di menu Ingredients.
                  </p>
                ) : (
                  availableIngredients.slice(0, 20).map((ingredient) => (
                    <label
                      key={ingredient['id']}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ingredient.name)}
                        onChange={() => toggleIngredient(ingredient.name)}
                        disabled={loading}
                        className="rounded"
                        aria-label={`Select ${ingredient.name}`}
                      />
                      <span className="text-sm">{ingredient.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* AI Logic Indicator */}
        <div className="bg-muted/50 border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-1">
                💡 Cara Kerja AI
              </p>
              <p className="text-xs text-foreground dark:text-gray-200">
                AI akan menyesuaikan resep berdasarkan {mode === 'quick' ? 'jenis produk & jumlah hasil' : 'target harga jual & bahan yang Anda pilih'}.
                Setiap hasil bisa berbeda untuk memberikan variasi terbaik.
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={(loading || false) || !productName || !servings}
          className="w-full  hover: transition-all"
          size="lg"
        >
          {loading ? (
            <>
              <ChefHat className="mr-2 h-5 w-5 animate-bounce" />
              <span className="font-semibold">Sedang Generate...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="font-semibold">Generate Resep dengan AI</span>
            </>
          )}
        </Button>

        {!loading && (!productName || !servings) && (
          <p className="text-xs text-center text-muted-foreground -mt-2">
            Isi nama produk dan jumlah hasil untuk mulai generate
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { RecipeGeneratorFormEnhanced }