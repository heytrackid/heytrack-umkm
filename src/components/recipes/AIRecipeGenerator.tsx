'use client'

import { Clock, History, Loader2, Sparkles, Trash2 } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { successToast } from '@/hooks/use-toast'
import { handleApiError, handleError } from '@/lib/error-handling'
import { useEffect, useState } from 'react'

import { deleteApi, fetchApi, postApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface GeneratedIngredient {
  name: string
  quantity: number
  unit: string
  notes?: string
  estimated_cost?: number
  matched_ingredient_id?: string | null
  price_per_unit?: number | null
}

interface GeneratedRecipe {
  name: string
  description: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  ingredients: GeneratedIngredient[]
  instructions: string[] | string
  instructions_array?: string[]
  tips?: string
  estimated_total_cost?: number
  suggested_price?: number
}

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

interface AIRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void
}

const DIETARY_OPTIONS = [
  { value: 'halal', label: '🕌 Halal' },
  { value: 'vegetarian', label: '🥬 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'gluten-free', label: '🌾 Bebas Gluten' },
  { value: 'dairy-free', label: '🥛 Bebas Susu' },
  { value: 'low-sugar', label: '🍬 Rendah Gula' },
]

const QUICK_TEMPLATES = [
  { name: 'Nasi Goreng Spesial', prompt: 'Nasi goreng dengan telur, ayam, dan sayuran, bumbu khas Indonesia' },
  { name: 'Ayam Geprek', prompt: 'Ayam goreng crispy dengan sambal bawang pedas' },
  { name: 'Brownies Coklat', prompt: 'Brownies coklat yang moist dan fudgy' },
  { name: 'Martabak Manis', prompt: 'Martabak manis dengan topping coklat dan keju' },
]

export function AIRecipeGenerator({ onRecipeGenerated }: AIRecipeGeneratorProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [prompt, setPrompt] = useState('')
  const [servings, setServings] = useState('4')
  const [cuisine, setCuisine] = useState('')
  const [dietary, setDietary] = useState<string[]>([])
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [selectedHistoryRecipe, setSelectedHistoryRecipe] = useState<GeneratedRecipe | null>(null)
  
  const queryClient = useQueryClient()

  // Fetch history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['recipe-history'],
    queryFn: () => fetchApi<HistoryResponse>('/api/recipes/history?limit=20'),
    enabled: open && activeTab === 'history',
  })

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: (data: { prompt: string; servings: number; cuisine?: string; dietary?: string[] }) =>
      postApi<{ recipe: GeneratedRecipe }>('/recipes/generate', data),
    onSuccess: (data) => {
      setGeneratedRecipe(data.recipe)
      successToast('Resep berhasil dibuat!', 'AI telah membuat resep dengan harga bahan yang realistis')
      // Invalidate history to show new recipe
      queryClient.invalidateQueries({ queryKey: ['recipe-history'] })
    },
    onError: (error) => handleApiError(error, 'AI Recipe Generator', 'Gagal membuat resep')
  })

  // Delete history mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => deleteApi(`/recipes/history?id=${id}`),
    onSuccess: () => {
      successToast('Berhasil dihapus', 'Resep telah dihapus dari history')
      queryClient.invalidateQueries({ queryKey: ['recipe-history'] })
    },
    onError: (error) => handleApiError(error, 'Delete History', 'Gagal menghapus history')
  })

  // Reset state when dialog closes - use requestAnimationFrame to avoid sync setState in effect
  useEffect(() => {
    if (!open) {
      requestAnimationFrame(() => {
        setGeneratedRecipe(null)
        setSelectedHistoryRecipe(null)
      })
    }
  }, [open])

  const handleGenerate = (): void => {
    if (!prompt.trim()) {
      handleError(new Error('Validation: Prompt diperlukan'), 'AI Recipe Generator: validation', true, 'Prompt diperlukan')
      return
    }

    setGeneratedRecipe(null)
    generateRecipeMutation.mutate({
      prompt: dietary.length > 0 ? `${prompt} (${dietary.join(', ')})` : prompt,
      servings: parseInt(servings),
      ...(cuisine ? { cuisine } : {}),
      dietary,
    })
  }

  const handleUseRecipe = (recipe: GeneratedRecipe): void => {
    if (recipe && onRecipeGenerated) {
      // Ensure instructions is an array with null safety
      const getInstructions = () => {
        if (recipe.instructions_array) return recipe.instructions_array
        if (Array.isArray(recipe.instructions)) return recipe.instructions
        if (typeof recipe.instructions === 'string') return recipe.instructions.split('\n')
        return []
      }
      const recipeToUse = {
        ...recipe,
        instructions: getInstructions()
      }
      onRecipeGenerated(recipeToUse)
      setOpen(false)
      setPrompt('')
      setGeneratedRecipe(null)
      setSelectedHistoryRecipe(null)
      successToast('Resep siap digunakan', 'Silakan lengkapi informasi tambahan dan simpan resep')
    }
  }

  const handleReset = (): void => {
    setPrompt('')
    setServings('4')
    setCuisine('')
    setDietary([])
    setGeneratedRecipe(null)
    setSelectedHistoryRecipe(null)
  }

  const handleViewHistoryRecipe = (item: HistoryItem): void => {
    setSelectedHistoryRecipe(item.recipe_data)
  }

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

  // Get the recipe to display (either generated or from history)
  const displayRecipe = generatedRecipe || selectedHistoryRecipe
  
  // Get instructions as array
  const getInstructionsArray = (recipe: GeneratedRecipe): string[] => {
    if (recipe.instructions_array) return recipe.instructions_array
    if (Array.isArray(recipe.instructions)) return recipe.instructions
    if (typeof recipe.instructions === 'string') return recipe.instructions.split('\n')
    return []
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate dengan AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Recipe Generator
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Buat Resep
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-4">
            {!displayRecipe ? (
              <>
                {/* Quick Templates */}
                {!prompt && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">🚀 Template Cepat</Label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_TEMPLATES.map((template) => (
                        <Button
                          key={template.name}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setPrompt(template.prompt)}
                          disabled={generateRecipeMutation.isPending}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prompt">Deskripsi Resep</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Contoh: Nasi goreng pedas dengan ayam dan sayuran, cocok untuk sarapan"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      disabled={generateRecipeMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Jelaskan resep yang ingin Anda buat dengan detail
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="servings">Porsi</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        max="100"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        disabled={generateRecipeMutation.isPending}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cuisine">Jenis Masakan (Opsional)</Label>
                      <Select value={cuisine} onValueChange={setCuisine} disabled={generateRecipeMutation.isPending}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua</SelectItem>
                          <SelectItem value="Indonesian">Indonesia</SelectItem>
                          <SelectItem value="Western">Western</SelectItem>
                          <SelectItem value="Chinese">Chinese</SelectItem>
                          <SelectItem value="Japanese">Japanese</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="grid gap-2">
                    <Label className="text-sm">Preferensi Diet (Opsional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={dietary.includes(option.value) ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setDietary((prev) =>
                              prev.includes(option.value)
                                ? prev.filter((d) => d !== option.value)
                                : [...prev, option.value]
                            )
                          }}
                          disabled={generateRecipeMutation.isPending}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleGenerate} disabled={generateRecipeMutation.isPending} className="flex-1">
                    {generateRecipeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Membuat Resep...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Resep
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>✨ Fitur Baru:</strong> Harga bahan sekarang menggunakan data dari database Anda 
                    untuk estimasi yang lebih akurat!
                  </p>
                </div>
              </>
            ) : (
              <RecipeDisplay 
                recipe={displayRecipe} 
                getInstructionsArray={getInstructionsArray}
                onReset={handleReset}
                onUseRecipe={() => handleUseRecipe(displayRecipe)}
                isFromHistory={!!selectedHistoryRecipe}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {selectedHistoryRecipe ? (
              <RecipeDisplay 
                recipe={selectedHistoryRecipe} 
                getInstructionsArray={getInstructionsArray}
                onReset={() => setSelectedHistoryRecipe(null)}
                onUseRecipe={() => handleUseRecipe(selectedHistoryRecipe)}
                isFromHistory={true}
              />
            ) : (
              <>
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
                            onClick={() => handleViewHistoryRecipe(item)}
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
                              onClick={() => handleViewHistoryRecipe(item)}
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Extracted component for recipe display
function RecipeDisplay({ 
  recipe, 
  getInstructionsArray,
  onReset,
  onUseRecipe,
  isFromHistory,
}: { 
  recipe: GeneratedRecipe
  getInstructionsArray: (recipe: GeneratedRecipe) => string[]
  onReset: () => void
  onUseRecipe: () => void
  isFromHistory: boolean
}): JSX.Element {
  const instructions = getInstructionsArray(recipe)
  
  return (
    <>
      <div className="space-y-4">
        <div className="bg-primary/10 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
          <p className="text-sm text-muted-foreground">{recipe.description}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span>🍽️ {recipe.servings} porsi</span>
            <span>⏱️ {recipe.prep_time + recipe.cook_time} menit</span>
            <span>📊 {recipe.difficulty}</span>
          </div>
          
          {/* Cost Estimation */}
          {(recipe.estimated_total_cost || recipe.suggested_price) && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <div className="flex flex-wrap gap-4 text-sm">
                {recipe.estimated_total_cost && (
                  <span className="text-orange-600 font-medium">
                    💰 Est. HPP: Rp {recipe.estimated_total_cost.toLocaleString('id-ID')}
                  </span>
                )}
                {recipe.suggested_price && (
                  <span className="text-green-600 font-medium">
                    🏷️ Saran Harga: Rp {recipe.suggested_price.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">🥕 Bahan-bahan:</h4>
          <div className="grid gap-1">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {ing.quantity} {ing.unit} {ing.name}
                    {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                  </span>
                  {ing.matched_ingredient_id && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                      ✓ DB
                    </span>
                  )}
                </span>
                {ing.estimated_cost !== undefined && (
                  <span className="text-muted-foreground text-xs">
                    Rp {ing.estimated_cost.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">👨‍🍳 Cara Membuat:</h4>
          <ol className="space-y-2 text-sm">
            {instructions.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-semibold text-primary min-w-[1.5rem]">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.tips && (
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold mb-1 text-sm">💡 Tips:</h4>
            <p className="text-sm text-muted-foreground">{recipe.tips}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={onReset} variant="outline" className="flex-1">
          {isFromHistory ? 'Kembali' : 'Generate Lagi'}
        </Button>
        <Button onClick={onUseRecipe} className="flex-1">
          Gunakan Resep Ini
        </Button>
      </div>
    </>
  )
}
