'use client'

import { ChefHat, Sparkles } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AIGeneratorActionsProps {
  isFormValid: boolean
  isGenerating: boolean
  isProductNameValid: boolean
  isIngredientsValid: boolean
  isServingsValid: boolean
  hasUnsavedChanges: boolean
  onGenerate: () => void
  onSaveDraft: () => void
  onReset: () => void
}

export function AIGeneratorActions({
  isFormValid,
  isGenerating,
  isProductNameValid,
  isIngredientsValid,
  isServingsValid,
  hasUnsavedChanges,
  onGenerate,
  onSaveDraft,
  onReset
}: AIGeneratorActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !isFormValid}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isGenerating ? (
              <>
                <ChefHat className="h-5 w-5 mr-2 animate-spin" />
                AI Sedang Meracik...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Resep dengan AI
              </>
            )}
          </Button>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={!hasUnsavedChanges}
              className="flex-1"
            >
              💾 Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="flex-1"
            >
              🔄 Reset Form
            </Button>
          </div>

          {!isFormValid && !isGenerating && (
            <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-orange-600">⚠️ Lengkapi form untuk generate:</p>
              {!isProductNameValid && <p>• Nama produk minimal 3 karakter</p>}
              {!isIngredientsValid && <p>• Minimal 3 bahan diperlukan</p>}
              {!isServingsValid && <p>• Jumlah porsi harus lebih dari 0</p>}
            </div>
          )}

          {isFormValid && !isGenerating && (
            <div className="text-sm text-green-600 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="font-medium">✅ Form siap! Klik generate untuk membuat resep.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
