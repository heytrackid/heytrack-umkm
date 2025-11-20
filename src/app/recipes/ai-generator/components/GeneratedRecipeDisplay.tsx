import { ChefHat, Clock, DollarSign } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'

import type { GeneratedRecipe, AvailableIngredient } from '@/app/recipes/ai-generator/components/types'

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
            <div className="mt-4 p-3 bg-muted dark:bg-green-950 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                💡 Rekomendasi Harga Jual
              </p>
              <p className="text-2xl font-bold text-muted-foreground mt-1">
                {formatCurrency(recipe.hpp.suggestedSellingPrice)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipe.ingredients?.map((ing, index) => (
              <div key={index} className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-lg">
                <span className="font-medium truncate max-w-[60%]">{ing.name}</span>
                <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cara Membuat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipe.instructions?.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg bg-muted/10">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    {step.description}
                  </p>
                  {step.duration_minutes && (
                    <div className="flex gap-2 mt-3">
                      {step.duration_minutes && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          ⏱️ {step.duration_minutes} menit
                        </span>
                      )}
                      {step.temperature && (
                        <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                          🌡️ {step.temperature}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {recipe.tips.map((tip, index) => (
                <div key={index} className="flex gap-3 p-3 bg-blue-50/30 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <span className="text-primary flex-shrink-0">💡</span>
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
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

export { GeneratedRecipeDisplay }