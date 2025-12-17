'use client'

import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import type { GeneratedRecipe } from '@/services/ai'
import { ChefHat, Clock, DollarSign, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RecipeEditor } from './components/RecipeEditor'
import { RecipePreview } from './components/RecipePreview'
import SimpleRecipeForm from './components/SimpleRecipeForm'

// Mock data - will be replaced with actual API calls
const recentGenerations = [
  {
    id: '1',
    name: 'Nasi Goreng Seafood Spesial',
    servings: 4,
    cost: 45000,
    time: '30 menit',
    difficulty: 'Medium',
    created: '2 jam lalu'
  },
  {
    id: '2',
    name: 'Ayam Bakar Madu',
    servings: 6,
    cost: 75000,
    time: '45 menit',
    difficulty: 'Medium',
    created: '1 hari lalu'
  }
]

export default function ChefWisePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecipe, setEditedRecipe] = useState<GeneratedRecipe | null>(null)

  const handleGenerateRecipe = async (formData: { prompt: string; servings: number }) => {
    // Guard against undefined formData
    if (!formData) {
      toast.error('Form data is missing')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/chef-wise/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: formData.prompt?.split(' ').slice(0, 5).join(' ') || 'Resep',
          productType: 'Custom',
          servings: formData.servings || 4,
          specialInstructions: formData.prompt || ''
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setGeneratedRecipe(result.data)
        toast.success('Recipe generated successfully!')
      } else {
        toast.error(result.error || 'Failed to generate recipe')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating recipe:', error)
      toast.error('An error occurred while generating the recipe')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/chef-wise/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: generatedRecipe.name,
          description: generatedRecipe.description,
          category: generatedRecipe.category,
          servings: generatedRecipe.servings,
          prepTimeMinutes: generatedRecipe.prep_time_minutes,
          cookTimeMinutes: generatedRecipe.cook_time_minutes,
          totalTimeMinutes: generatedRecipe.total_time_minutes,
          difficulty: generatedRecipe.difficulty,
          cookingMethod: generatedRecipe.cooking_method,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
          nutritionInfo: generatedRecipe.nutrition_info
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Recipe saved successfully!')
      } else {
        toast.error(result.error || 'Failed to save recipe')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving recipe:', error)
      toast.error('An error occurred while saving the recipe')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditRecipe = () => {
    if (generatedRecipe) {
      setEditedRecipe({ ...generatedRecipe })
      setIsEditing(true)
    }
  }

  const handleNewRecipe = () => {
    setGeneratedRecipe(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title="ChefWise AI"
          description="Generate resep kuliner dengan AI cerdas yang disesuaikan dengan inventory dan preferensi Anda"
          actions={
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Powered by Advanced AI
              </span>
            </div>
          }
        />

        {/* Stats Cards */}
        <UiStatsCards
          stats={([
            {
              title: 'Total Resep Dibuat',
              value: 24,
              description: '+3 minggu ini',
              icon: ChefHat,
            },
            {
              title: 'Rata-rata Biaya',
              value: 'Rp 45K',
              description: 'per resep',
              icon: DollarSign,
            },
            {
              title: 'Waktu Aktif',
              value: '35m',
              description: 'rata-rata',
              icon: Clock,
            },
            {
              title: 'Hemat Biaya',
              value: '15%',
              description: 'vs harga pasar',
              icon: DollarSign,
            },
          ] satisfies StatCardData[])}
          gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4"
        />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isEditing && editedRecipe ? (
              <RecipeEditor
                recipe={editedRecipe}
                onSave={async (recipe: GeneratedRecipe) => {
                  setGeneratedRecipe(recipe)
                  setIsEditing(false)
                  setEditedRecipe(null)
                }}
                onCancel={() => {
                  setIsEditing(false)
                  setEditedRecipe(null)
                }}
                isSaving={isSaving}
              />
            ) : generatedRecipe ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <h2 className="text-lg font-semibold">Generated Recipe</h2>
                  <Button variant="outline" onClick={handleNewRecipe}>
                    Generate New Recipe
                  </Button>
                </div>
                <RecipePreview
                  recipe={generatedRecipe}
                  onSave={handleSaveRecipe}
                  onEdit={handleEditRecipe}
                  isSaving={isSaving}
                />
              </div>
            ) : (
              <SimpleRecipeForm onSubmit={handleGenerateRecipe} isLoading={isGenerating} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Generations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Terbaru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGenerations.map((recipe) => (
                  <div key={recipe.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{recipe.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {recipe.servings} porsi
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {recipe.time}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-primary">
                          Rp {recipe.cost.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {recipe.created}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  Lihat Semua
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips ChefWise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>• Sebutkan bahan yang tersedia untuk optimasi biaya</p>
                  <p>• Tentukan preferensi diet (halal, vegan, dll)</p>
                  <p>• Gunakan deskripsi detail untuk hasil terbaik</p>
                  <p>• Coba &quot;Substitute Ingredients&quot; untuk hemat biaya</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
