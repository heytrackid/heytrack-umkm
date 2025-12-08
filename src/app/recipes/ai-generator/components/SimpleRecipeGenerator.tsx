'use client'

import { CheckCircle, ChefHat, Clock, ExternalLink, History, Loader2, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useGenerateRecipeEnhanced } from '@/hooks/api/useAIRecipeEnhanced'
import { useAuth, useAuthMe } from '@/hooks/index'
import { successToast } from '@/hooks/use-toast'
import { useIngredientsList } from '@/hooks/useIngredients'
import { useCreateRecipeWithIngredients } from '@/hooks/useRecipes'
import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Insert } from '@/types/database'
import type { GeneratedRecipe } from './types'

// History item interface
interface HistoryItem {
  id: string
  prompt: string
  servings: number
  cuisine: string | null
  recipe_data: GeneratedRecipe
  total_estimated_cost: number | null
  created_at: string
}

interface HistoryResponse {
  items: HistoryItem[]
  total: number
}

// Template prompts untuk membantu user
const PROMPT_TEMPLATES = [
  {
    title: '🍰 Kue Ulang Tahun',
    prompt: 'Buatkan resep kue ulang tahun coklat yang lembut untuk 12 porsi. Bahan utama: tepung terigu, coklat bubuk, telur, gula, mentega. Target harga jual Rp 150.000',
  },
  {
    title: '🍜 Mie Ayam',
    prompt: 'Resep mie ayam untuk jualan, 20 porsi. Bahan: mie telur, ayam fillet, kecap manis, bawang putih, daun bawang. Budget bahan maksimal Rp 200.000',
  },
  {
    title: '🥤 Es Kopi Susu',
    prompt: 'Resep es kopi susu kekinian untuk 10 gelas. Bahan: kopi robusta, susu UHT, gula aren cair. Target HPP per gelas Rp 5.000',
  },
  {
    title: '🍞 Roti Sobek',
    prompt: 'Resep roti sobek lembut untuk 15 porsi. Bahan: tepung cakra, ragi instan, susu bubuk, mentega, telur, gula. Cocok untuk jualan',
  },
  {
    title: '🍗 Ayam Geprek',
    prompt: 'Resep ayam geprek crispy untuk 25 porsi. Bahan: ayam paha, tepung bumbu, sambal bawang. Target harga jual Rp 15.000 per porsi',
  },
  {
    title: '🧁 Brownies',
    prompt: 'Resep brownies panggang fudgy untuk 16 potong. Bahan: dark chocolate, mentega, telur, gula, tepung. Target margin 40%',
  },
]

interface SimpleRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void
}

export function SimpleRecipeGenerator({ onRecipeGenerated }: SimpleRecipeGeneratorProps) {
  const { isAuthenticated } = useAuth()
  const { data: authData } = useAuthMe()
  const { data: ingredients = [] } = useIngredientsList()
  const createRecipeWithIngredients = useCreateRecipeWithIngredients()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('create')
  const [prompt, setPrompt] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [selectedHistoryRecipe, setSelectedHistoryRecipe] = useState<GeneratedRecipe | null>(null)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const router = useRouter()

  // Fetch history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['recipe-history'],
    queryFn: () => fetchApi<HistoryResponse>('/api/recipes/history?limit=20'),
    enabled: activeTab === 'history',
  })

  // Delete history mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => deleteApi(`/api/recipes/history?id=${id}`),
    onSuccess: () => {
      successToast('Berhasil dihapus', 'Resep telah dihapus dari history')
      queryClient.invalidateQueries({ queryKey: ['recipe-history'] })
    },
    onError: () => {
      handleError(new Error('Failed to delete'), 'Delete History', true, 'Gagal menghapus history')
    }
  })

  const {
    generate: generateRecipe,
    isPending: isGenerating,
    progress,
  } = useGenerateRecipeEnhanced((data: GeneratedRecipe) => {
    setGeneratedRecipe(data)
    onRecipeGenerated?.(data)
    // Invalidate history to show new recipe
    queryClient.invalidateQueries({ queryKey: ['recipe-history'] })
  })

  // Parse prompt to extract recipe params
  const parsePromptToParams = useCallback((promptText: string) => {
    // Extract ingredients from prompt (words after "bahan:" or common ingredient names)
    const ingredientPatterns = [
      /bahan[:\s]+([^.]+)/i,
      /menggunakan[:\s]+([^.]+)/i,
      /dengan[:\s]+([^.]+)/i,
    ]

    let extractedIngredients: string[] = []
    for (const pattern of ingredientPatterns) {
      const match = promptText.match(pattern)
      if (match?.[1]) {
        extractedIngredients = match[1]
          .split(/[,;dan]+/)
          .map(s => s.trim())
          .filter(s => s.length > 2)
        break
      }
    }

    // Extract servings
    const servingsMatch = promptText.match(/(\d+)\s*(porsi|gelas|potong|buah|pcs)/i)
    const servings = servingsMatch?.[1] ? parseInt(servingsMatch[1], 10) : 12

    // Extract target price
    const priceMatch = promptText.match(/(?:rp|idr)[\s.]*([\d.,]+)/i)
    const targetPrice = priceMatch?.[1] ? parseInt(priceMatch[1].replace(/[.,]/g, ''), 10) : 0

    // Extract product name (first few words or before "untuk" or comma)
    const nameMatch = promptText.match(/resep\s+(.+?)(?:\s+untuk|\s+dengan|\s*,|$)/i)
    const productName = nameMatch?.[1]?.trim() || promptText.slice(0, 50).trim()

    return {
      name: productName,
      type: 'main-dish',
      servings,
      targetPrice,
      dietaryRestrictions: [],
      preferredIngredients: [],
      customIngredients: extractedIngredients.length > 0 ? extractedIngredients : ['bahan utama'],
      specialInstructions: promptText,
    }
  }, [])

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      handleError(new Error('Prompt kosong'), 'Simple Recipe Generator', true, 'Tulis dulu apa yang ingin kamu buat!')
      return
    }

    if (prompt.trim().length < 10) {
      handleError(new Error('Prompt terlalu pendek'), 'Simple Recipe Generator', true, 'Deskripsikan lebih detail resep yang kamu inginkan')
      return
    }

    const params = parsePromptToParams(prompt)
    setGeneratedRecipe(null)
    generateRecipe(params)
  }, [prompt, parsePromptToParams, generateRecipe])

  const handleSaveRecipe = useCallback(async () => {
    // Use either the newly generated recipe OR the selected history recipe
    const recipeToSave = generatedRecipe || selectedHistoryRecipe
    if (!recipeToSave) return
    
    const userId = (authData as { userId?: string })?.userId
    if (!userId) {
      handleError(new Error('Not authenticated'), 'Save Recipe', true, 'Silakan login terlebih dahulu')
      return
    }

    try {
      const recipeData: Insert<'recipes'> = {
        user_id: userId,
        name: recipeToSave.name,
        category: recipeToSave.category,
        servings: recipeToSave.servings,
        prep_time: recipeToSave.prep_time_minutes,
        cook_time: recipeToSave.cook_time_minutes ?? recipeToSave.bake_time_minutes ?? 0,
        description: recipeToSave.description,
        instructions: JSON.stringify(recipeToSave.instructions),
        is_active: true,
      }

      const ingredientsData = recipeToSave.ingredients
        .map((ing) => {
          const ingredient = ingredients.find(
            i => i.name.toLowerCase() === ing.name.toLowerCase()
          )
          if (!ingredient) return null
          return {
            ingredient_id: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: '',
          }
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)

      const result = await createRecipeWithIngredients.mutateAsync({
        recipe: recipeData,
        ingredients: ingredientsData,
      })

      // Show success with recipe ID
      if (result?.id) {
        setSavedRecipeId(result.id)
      }
      setGeneratedRecipe(null)
      setSelectedHistoryRecipe(null)
      setPrompt('')
    } catch (error) {
      handleError(error as Error, 'Save Recipe', true, 'Gagal menyimpan resep')
    }
  }, [generatedRecipe, selectedHistoryRecipe, ingredients, createRecipeWithIngredients, authData])

  const handleSelectTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setPrompt(template.prompt)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Silakan login untuk menggunakan AI Recipe Generator</p>
      </div>
    )
  }

  // Helper to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Show success dialog after save
  if (savedRecipeId) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Resep Berhasil Disimpan! 🎉</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Resep sudah tersimpan dan siap digunakan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              <Button 
                onClick={() => router.push(`/recipes/${savedRecipeId}`)}
                className="flex-1 gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Lihat Resep
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSavedRecipeId(null)}
                className="flex-1"
              >
                Buat Resep Lain
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="create" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Buat Resep
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <History className="h-4 w-4" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Buat Resep dengan AI
            </CardTitle>
            <CardDescription>
              Tulis apa yang ingin kamu buat. Semakin detail, semakin bagus hasilnya!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Contoh: Buatkan resep brownies coklat untuk 16 potong. Bahan: dark chocolate, mentega, telur, gula, tepung. Target harga jual Rp 80.000"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isGenerating}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Sebutkan nama produk, jumlah porsi, bahan-bahan, dan target harga
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress?.message || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Resep
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Prompts */}
        {!generatedRecipe && !isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">✨ Contoh Prompt</CardTitle>
              <CardDescription>Klik salah satu untuk langsung pakai</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PROMPT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-3 text-left rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-colors"
                  >
                    <p className="font-medium text-sm">{template.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generation Progress */}
        {isGenerating && progress && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{progress.message}</p>
                  <div className="w-48 h-2 bg-muted rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Recipe Result */}
        {generatedRecipe && !isGenerating && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    {generatedRecipe.name}
                  </CardTitle>
                  <CardDescription>{generatedRecipe.description}</CardDescription>
                </div>
                <Button onClick={handleSaveRecipe} disabled={createRecipeWithIngredients.isPending}>
                  {createRecipeWithIngredients.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Simpan Resep
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Porsi:</span>
                  <span className="font-medium">{generatedRecipe.servings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Prep:</span>
                  <span className="font-medium">{generatedRecipe.prep_time_minutes} menit</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Masak:</span>
                  <span className="font-medium">{generatedRecipe.cook_time_minutes ?? generatedRecipe.bake_time_minutes ?? 0} menit</span>
                </div>
                {generatedRecipe.hpp && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Est. HPP:</span>
                    <span className="font-medium">
                      Rp {generatedRecipe.hpp.totalHPP.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-medium mb-2">🥘 Bahan-bahan</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                  {generatedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {ing.quantity} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-medium mb-2">📝 Langkah-langkah</h4>
                <ol className="space-y-2 text-sm">
                  {generatedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {step.step || idx + 1}
                      </span>
                      <div>
                        {step.title && <span className="font-medium">{step.title}: </span>}
                        <span>{step.description}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">💡 Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {generatedRecipe.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedRecipe(null)
                    setPrompt('')
                  }}
                >
                  Buat Resep Lain
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedRecipe(null)}
                >
                  Edit Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        {selectedHistoryRecipe ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    {selectedHistoryRecipe.name}
                  </CardTitle>
                  <CardDescription>{selectedHistoryRecipe.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Porsi:</span>
                  <span className="font-medium">{selectedHistoryRecipe.servings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Prep:</span>
                  <span className="font-medium">{selectedHistoryRecipe.prep_time_minutes} menit</span>
                </div>
                {selectedHistoryRecipe.hpp && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Est. HPP:</span>
                    <span className="font-medium text-orange-600">
                      Rp {selectedHistoryRecipe.hpp.totalHPP.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-medium mb-2">🥘 Bahan-bahan</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                  {selectedHistoryRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {ing.quantity} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-medium mb-2">📝 Langkah-langkah</h4>
                <ol className="space-y-2 text-sm">
                  {selectedHistoryRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {step.step || idx + 1}
                      </span>
                      <div>
                        {step.title && <span className="font-medium">{step.title}: </span>}
                        <span>{step.description}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedHistoryRecipe(null)}
                >
                  Kembali ke History
                </Button>
                <Button onClick={handleSaveRecipe} disabled={createRecipeWithIngredients.isPending}>
                  {createRecipeWithIngredients.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Simpan Resep
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                History Resep AI
              </CardTitle>
              <CardDescription>Resep-resep yang pernah kamu generate</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : historyData?.items && historyData.items.length > 0 ? (
                <div className="space-y-3">
                  {historyData.items.map((item: HistoryItem) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedHistoryRecipe(item.recipe_data)}
                        >
                          <h4 className="font-medium">{item.recipe_data.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.recipe_data.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.created_at)}
                            </span>
                            {item.total_estimated_cost && (
                              <span className="text-orange-600 font-medium">
                                Rp {item.total_estimated_cost.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedHistoryRecipe(item.recipe_data)}
                          >
                            Lihat
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteHistoryMutation.mutate(item.id)}
                            disabled={deleteHistoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada resep yang di-generate</p>
                  <p className="text-sm mt-1">
                    Generate resep baru untuk melihat history di sini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}

