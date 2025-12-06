'use client'

import { ChefHat } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'

import { GeneratedRecipeDisplay } from './GeneratedRecipeDisplay'
import type { AvailableIngredient, GeneratedRecipe } from './types'

interface AIGeneratorPreviewProps {
  isGenerating: boolean
  generatedRecipe: GeneratedRecipe | null
  activeTab: 'input' | 'preview'
  availableIngredients: AvailableIngredient[]
  onSave: () => Promise<void>
  onGenerateAgain: () => void
}

export function AIGeneratorPreview({
  isGenerating,
  generatedRecipe,
  activeTab,
  availableIngredients,
  onSave,
  onGenerateAgain
}: AIGeneratorPreviewProps) {
  // Loading state
  if (isGenerating) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 animate-pulse">
        <CardContent className="py-16">
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto animate-bounce">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 mx-auto animate-ping opacity-20" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ✨ AI sedang meracik resep...
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Membuat resep profesional yang disesuaikan dengan kebutuhan bisnis Anda
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-loading-progress" 
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Memahami permintaan Anda</span>
                <span>Meracik resep unggulan</span>
              </div>
            </div>

            <style jsx>{`
              @keyframes loading-progress {
                0% { width: 0%; }
                50% { width: 70%; }
                100% { width: 100%; }
              }
              .animate-loading-progress {
                animation: loading-progress 3s infinite;
              }
            `}</style>

            <div className="text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full inline-block">
              ⏱️ Estimasi selesai dalam 15-30 detik
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generated recipe display
  if (generatedRecipe && activeTab === 'preview') {
    return (
      <GeneratedRecipeDisplay
        recipe={generatedRecipe}
        onSave={onSave}
        onGenerateAgain={onGenerateAgain}
        availableIngredients={availableIngredients}
      />
    )
  }

  // Empty state
  if (!isGenerating && !generatedRecipe && activeTab === 'preview') {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Preview Resep AI</h3>
            <p className="text-muted-foreground">
              Isi form di sebelah kiri untuk melihat preview resep yang akan dihasilkan
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
