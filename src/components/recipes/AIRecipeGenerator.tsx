'use client'

import { Loader2, Sparkles } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { successToast } from '@/hooks/use-toast'
import { handleApiError, handleError } from '@/lib/error-handling'
import { useState } from 'react'

import { postApi } from '@/lib/query/query-helpers'
import { useMutation } from '@tanstack/react-query'

interface GeneratedRecipe {
  name: string
  description: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    notes?: string
    estimated_cost?: number
  }>
  instructions: string[]
  tips?: string
  estimated_total_cost?: number
  suggested_price?: number
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
  { name: 'Es Teh Manis', prompt: 'Minuman teh manis dingin yang menyegarkan' },
  { name: 'Martabak Manis', prompt: 'Martabak manis dengan topping coklat dan keju' },
]

export function AIRecipeGenerator({ onRecipeGenerated }: AIRecipeGeneratorProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [servings, setServings] = useState('4')
  const [cuisine, setCuisine] = useState('')
  const [dietary, setDietary] = useState<string[]>([])
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)

  // ✅ Use React Query mutation instead of manual fetch
  const generateRecipeMutation = useMutation({
    mutationFn: (data: { prompt: string; servings: number; cuisine?: string }) =>
      postApi<{ recipe: GeneratedRecipe }>('/recipes/generate', data),
    onSuccess: (data) => {
      setGeneratedRecipe(data.recipe)
      successToast('Resep berhasil dibuat!', 'AI telah membuat resep untuk Anda')
    },
    onError: (error) => handleApiError(error, 'AI Recipe Generator', 'Gagal membuat resep')
  })

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
    })
  }

  const handleUseRecipe = (): void => {
    if (generatedRecipe && onRecipeGenerated) {
      onRecipeGenerated(generatedRecipe)
      setOpen(false)
      setPrompt('')
      setGeneratedRecipe(null)
      successToast('Resep siap digunakan', 'Silakan lengkapi informasi tambahan dan simpan resep')
    }
  }

  const handleReset = (): void => {
    setPrompt('')
    setServings('4')
    setCuisine('')
    setDietary([])
    setGeneratedRecipe(null)
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

        <div className="space-y-6">
          {!generatedRecipe ? (
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
                  <strong>Catatan:</strong> AI Recipe Generator menggunakan OpenRouter API. 
                  Pastikan OPENROUTER_API_KEY sudah dikonfigurasi di environment variables.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{generatedRecipe.name}</h3>
                  <p className="text-sm text-muted-foreground">{generatedRecipe.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span>🍽️ {generatedRecipe.servings} porsi</span>
                    <span>⏱️ {generatedRecipe.prep_time + generatedRecipe.cook_time} menit</span>
                    <span>📊 {generatedRecipe.difficulty}</span>
                  </div>
                  
                  {/* Cost Estimation */}
                  {(generatedRecipe.estimated_total_cost || generatedRecipe.suggested_price) && (
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <div className="flex flex-wrap gap-4 text-sm">
                        {generatedRecipe.estimated_total_cost && (
                          <span className="text-orange-600 font-medium">
                            💰 Est. HPP: Rp {generatedRecipe.estimated_total_cost.toLocaleString('id-ID')}
                          </span>
                        )}
                        {generatedRecipe.suggested_price && (
                          <span className="text-green-600 font-medium">
                            🏷️ Saran Harga: Rp {generatedRecipe.suggested_price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bahan-bahan:</h4>
                  <ul className="space-y-1 text-sm">
                    {generatedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>
                          {ing.quantity} {ing.unit} {ing.name}
                          {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cara Membuat:</h4>
                  <ol className="space-y-2 text-sm">
                    {generatedRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-semibold text-primary">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {generatedRecipe.tips && (
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold mb-1 text-sm">💡 Tips:</h4>
                    <p className="text-sm text-muted-foreground">{generatedRecipe.tips}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Generate Lagi
                </Button>
                <Button onClick={handleUseRecipe} className="flex-1">
                  Gunakan Resep Ini
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
