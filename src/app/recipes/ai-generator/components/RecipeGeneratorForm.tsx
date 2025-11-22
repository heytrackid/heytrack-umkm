'use client'

import React from 'react'
import { AlertCircle, ChefHat, Loader2, Sparkles, CheckCircle, XCircle } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'


import type { AvailableIngredient } from '@/app/recipes/ai-generator/components/types'

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

const RecipeGeneratorForm = ({
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
}: RecipeGeneratorFormProps) => {
  // Form validation
  const isProductNameValid = productName.trim().length >= 3
  const isProductTypeValid = productType !== ''
  const isServingsValid = servings >= 1 && servings <= 100
  const isTargetPriceValid = targetPrice === '' || (!isNaN(parseFloat(targetPrice)) && parseFloat(targetPrice) > 0)
  const isFormValid = isProductNameValid && isProductTypeValid && isServingsValid && isTargetPriceValid && selectedIngredients.length > 0

  const [internalIngredients, setInternalIngredients] = React.useState('')

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(
      dietaryRestrictions.includes(restriction)
        ? dietaryRestrictions.filter(r => r !== restriction)
        : [...dietaryRestrictions, restriction]
    )
  }

  // Sync internal state when props change (and input is not focused)
  React.useEffect(() => {
    const joined = selectedIngredients.join(', ')
    // Only update if significantly different (e.g. cleared externally) to avoid cursor jumps
    if (selectedIngredients.length === 0 && internalIngredients.length > 0) {
        setInternalIngredients('')
    } else if (selectedIngredients.length > 0 && internalIngredients === '') {
        setInternalIngredients(joined)
    }
  }, [selectedIngredients, internalIngredients])
  
  const handleIngredientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalIngredients(e.target.value)
  }

  const handleIngredientsBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value
    const parsed = rawValue
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
    
    setSelectedIngredients(parsed)
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
          <div className="flex items-center justify-between">
            <Label htmlFor="productName">Nama Produk *</Label>
            {productName && (
              isProductNameValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )
            )}
          </div>
          <Input
            id="productName"
            placeholder="Contoh: Roti Tawar Premium"
            value={productName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
            className={productName && !isProductNameValid ? "border-red-500 focus:border-red-500" : ""}
          />
          {productName && !isProductNameValid && (
            <p className="text-sm text-red-500">Nama produk minimal 3 karakter</p>
          )}
        </div>

        {/* Product Type */}
        <div className="space-y-2">
          <Label htmlFor="productType">Jenis Produk *</Label>
          <Input
            id="productType"
            placeholder="Contoh: Roti, Kue, Donat"
            value={productType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductType(e.target.value)}
            className={productType === '' ? "border-red-500 focus:border-red-500" : ""}
          />
        </div>

        {/* Servings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="servings">Jumlah Porsi *</Label>
            {servings > 0 && (
              isServingsValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )
            )}
          </div>
          <Input
            id="servings"
            type="number"
            min="1"
            max="100"
            placeholder="Contoh: 12"
            value={servings}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServings(parseInt(e.target.value) || 1)}
            className={servings > 0 && !isServingsValid ? "border-red-500 focus:border-red-500" : ""}
          />
          {servings > 0 && !isServingsValid && (
            <p className="text-sm text-red-500">Jumlah porsi harus antara 1-100</p>
          )}
        </div>

        {/* Target Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="targetPrice">Harga Jual Target (Opsional)</Label>
            {targetPrice && (
              isTargetPriceValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )
            )}
          </div>
          <Input
            id="targetPrice"
            placeholder="Contoh: 15000"
            value={targetPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetPrice(e.target.value)}
            className={targetPrice && !isTargetPriceValid ? "border-red-500 focus:border-red-500" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Harga jual per porsi yang diinginkan (dalam Rupiah)
          </p>
          {targetPrice && !isTargetPriceValid && (
            <p className="text-sm text-red-500">Masukkan angka yang valid (contoh: 15000)</p>
          )}
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
          <div className="flex items-center justify-between">
            <Label>Bahan yang Ingin Digunakan *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIngredients.length} bahan dipilih
              </span>
              {selectedIngredients.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <Textarea
            placeholder="Contoh: coklat premium, keju cheddar, kismis"
            value={internalIngredients}
            onChange={handleIngredientsChange}
            onBlur={handleIngredientsBlur}
            rows={3}
            className={selectedIngredients.length === 0 && internalIngredients.length === 0 ? "border-red-500 focus:border-red-500" : ""}
            disabled={false}
          />
          <p className="text-xs text-muted-foreground">
            Pisahkan dengan koma (contoh: tepung terigu, gula pasir, telur ayam). Dukungan simbol & spasi penuh.
          </p>
          {selectedIngredients.length === 0 && (
            <p className="text-sm text-red-500">Pilih minimal 1 bahan untuk generate resep</p>
          )}
        </div>

        {/* Generate Button */}
        <div className="space-y-2">
          <Button
            onClick={onGenerate}
            disabled={loading || !isFormValid}
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

          {!isFormValid && !loading && (
            <div className="text-sm text-muted-foreground space-y-1">
              {!isProductNameValid && <p>• Nama produk minimal 3 karakter</p>}
              {!isProductTypeValid && <p>• Pilih jenis produk</p>}
              {!isServingsValid && <p>• Jumlah porsi harus 1-100</p>}
              {targetPrice && !isTargetPriceValid && <p>• Harga target harus angka valid</p>}
              {selectedIngredients.length === 0 && <p>• Pilih minimal 1 bahan</p>}
            </div>
          )}
        </div>

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

export { RecipeGeneratorForm }