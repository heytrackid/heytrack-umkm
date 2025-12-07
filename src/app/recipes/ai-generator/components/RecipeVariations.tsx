'use client'

import { Flame, Heart, Leaf, Sparkles, Wallet } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { VariationType } from '@/hooks/api/useAIRecipeEnhanced'
import type { GeneratedRecipe } from './types'

interface RecipeVariationsProps {
  baseRecipe: GeneratedRecipe
  onGenerateVariation: (type: VariationType) => Promise<void>
  isGenerating: boolean
  className?: string
}

const variationTypes: Array<{
  type: VariationType
  label: string
  description: string
  icon: typeof Flame
  color: string
  bgColor: string
}> = [
  {
    type: 'spicier',
    label: 'Lebih Pedas',
    description: 'Tambah level pedas dengan cabai dan rempah',
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200'
  },
  {
    type: 'sweeter',
    label: 'Lebih Manis',
    description: 'Tingkatkan rasa manis untuk pecinta dessert',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
  },
  {
    type: 'healthier',
    label: 'Lebih Sehat',
    description: 'Kurangi gula dan lemak, tambah nutrisi',
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200'
  },
  {
    type: 'budget',
    label: 'Ekonomis',
    description: 'Bahan lebih terjangkau tanpa kurangi rasa',
    icon: Wallet,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  },
  {
    type: 'premium',
    label: 'Premium',
    description: 'Bahan berkualitas tinggi untuk hasil terbaik',
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
  }
]

export function RecipeVariations({
  baseRecipe,
  onGenerateVariation,
  isGenerating,
  className
}: RecipeVariationsProps) {
  const [selectedType, setSelectedType] = useState<VariationType | null>(null)
  const [generatedVariation, setGeneratedVariation] = useState<{
    name: string
    description: string
    ingredient_changes: Array<{ original: string; modified: string; reason: string }>
    instruction_changes: string[]
  } | null>(null)

  const handleGenerate = async (type: VariationType) => {
    setSelectedType(type)
    setGeneratedVariation(null)
    await onGenerateVariation(type)
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Variasi Resep
        </CardTitle>
        <CardDescription>
          Buat variasi dari &quot;{baseRecipe.name}&quot; dengan satu klik
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Variation buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {variationTypes.map((variation) => {
            const Icon = variation.icon
            const isSelected = selectedType === variation.type
            
            return (
              <Button
                key={variation.type}
                variant="outline"
                className={cn(
                  'h-auto flex-col py-3 px-2 gap-1 transition-all',
                  variation.bgColor,
                  isSelected && 'ring-2 ring-primary'
                )}
                onClick={() => handleGenerate(variation.type)}
                disabled={isGenerating}
              >
                <Icon className={cn('h-5 w-5', variation.color)} />
                <span className="text-xs font-medium">{variation.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Selected variation info */}
        {selectedType && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2">
              {(() => {
                const v = variationTypes.find(v => v.type === selectedType)
                if (!v) return null
                const Icon = v.icon
                return (
                  <>
                    <Icon className={cn('h-4 w-4', v.color)} />
                    <span className="font-medium">{v.label}</span>
                  </>
                )
              })()}
            </div>
            <p className="text-sm text-muted-foreground">
              {variationTypes.find(v => v.type === selectedType)?.description}
            </p>
          </div>
        )}

        {/* Generated variation preview */}
        {generatedVariation && (
          <div className="space-y-3 p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{generatedVariation.name}</h4>
              <Badge variant="secondary">Preview</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {generatedVariation.description}
            </p>

            {generatedVariation.ingredient_changes.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Perubahan Bahan:</h5>
                <ul className="space-y-1">
                  {generatedVariation.ingredient_changes.map((change, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground line-through">{change.original}</span>
                      <span>→</span>
                      <span className="text-primary">{change.modified}</span>
                      <span className="text-xs text-muted-foreground">({change.reason})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {generatedVariation.instruction_changes.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Tips Tambahan:</h5>
                <ul className="space-y-1">
                  {generatedVariation.instruction_changes.map((tip, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {isGenerating && selectedType && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Membuat variasi...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
