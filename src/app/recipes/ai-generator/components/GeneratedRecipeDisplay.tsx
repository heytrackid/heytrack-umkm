import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Clock, DollarSign } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'
import type { GeneratedRecipe, AvailableIngredient } from './types'

// Generated Recipe Display Component - Lazy Loaded
// Displays the complete AI-generated recipe with all sections


interface GeneratedRecipeDisplayProps {
  recipe: GeneratedRecipe
  onSave: () => void
  onGenerateAgain: () => void
  availableIngredients: AvailableIngredient[]
}

const GeneratedRecipeDisplay = ({
  recipe,
  onSave,
  onGenerateAgain
}: GeneratedRecipeDisplayProps) => {
  const { formatCurrency } = useSettings()

  return (
    <div className="space-y-6">
      {/* Recipe Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{recipe.name}</CardTitle>
              <CardDescription className="mt-2">
                {recipe.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {recipe.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-medium">{recipe.total_time_minutes} min</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <ChefHat className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-medium">{recipe.servings} units</p>
              <p className="text-xs text-muted-foreground">Yield</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-medium">
                {formatCurrency(recipe.hpp?.hppPerUnit ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">HPP/unit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HPP Calculation */}
      {recipe.hpp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perhitungan HPP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Biaya Bahan Baku</span>
              <span className="font-medium">
                {formatCurrency(recipe.hpp.totalMaterialCost)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm">Biaya Operasional (estimasi)</span>
              <span className="font-medium">
                {formatCurrency(recipe.hpp.estimatedOperationalCost)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b font-semibold">
              <span>Total HPP</span>
              <span>{formatCurrency(recipe.hpp.totalHPP)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold text-primary">
              <span>HPP per Unit</span>
              <span>{formatCurrency(recipe.hpp.hppPerUnit)}</span>
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                💡 Rekomendasi Harga Jual
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(recipe.hpp.suggestedSellingPrice)}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Margin: ~{recipe.hpp.estimatedMargin}% (Sehat!)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bahan-Bahan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ing, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="font-medium">{ing.name}</span>
                <span className="text-sm text-muted-foreground">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cara Membuat</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {recipe.instructions?.map((step, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.duration_minutes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ⏱️ {step.duration_minutes} menit
                      {step.temperature && ` • 🌡️ ${step.temperature}`}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-primary">💡</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Storage & Shelf Life */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Penyimpanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium">Cara Penyimpanan:</p>
            <p className="text-sm text-muted-foreground">{recipe.storage}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Shelf Life:</p>
            <p className="text-sm text-muted-foreground">{recipe.shelf_life}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onSave} className="flex-1" size="lg">
          💾 Simpan Resep
        </Button>
        <Button
          variant="outline"
          onClick={onGenerateAgain}
          size="lg"
        >
          🔄 Generate Lagi
        </Button>
      </div>
    </div>
  )
}

export default GeneratedRecipeDisplay
