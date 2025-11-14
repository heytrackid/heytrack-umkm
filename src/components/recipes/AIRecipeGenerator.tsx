'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface GeneratedRecipe {
  name: string
  description: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category: string
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    notes?: string
  }>
  instructions: string[]
  tips?: string
}

interface AIRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void
}

export function AIRecipeGenerator({ onRecipeGenerated }: AIRecipeGeneratorProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [servings, setServings] = useState('4')
  const [cuisine, setCuisine] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) {
      toast.error('Prompt diperlukan', {
        description: 'Silakan masukkan deskripsi resep yang ingin dibuat',
      })
      return
    }

    setLoading(true)
    setGeneratedRecipe(null)

    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          servings: parseInt(servings),
          cuisine: cuisine || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate recipe')
      }

      if (data.success && data.recipe) {
        setGeneratedRecipe(data.recipe)
        toast.success('Resep berhasil dibuat!', {
          description: 'AI telah membuat resep untuk Anda',
        })
      } else {
        throw new Error('Invalid response from AI')
      }
    } catch (error) {
      logger.error({ error }, 'AI Generation Error')
      toast.error('Gagal membuat resep', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat resep',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUseRecipe = (): void => {
    if (generatedRecipe && onRecipeGenerated) {
      onRecipeGenerated(generatedRecipe)
      setOpen(false)
      setPrompt('')
      setGeneratedRecipe(null)
      toast.success('Resep siap digunakan', {
        description: 'Silakan lengkapi informasi tambahan dan simpan resep',
      })
    }
  }

  const handleReset = (): void => {
    setPrompt('')
    setServings('4')
    setCuisine('')
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
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="prompt">Deskripsi Resep</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Contoh: Nasi goreng pedas dengan ayam dan sayuran, cocok untuk sarapan"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    disabled={loading}
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
                      disabled={loading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cuisine">Jenis Masakan (Opsional)</Label>
                    <Select value={cuisine} onValueChange={setCuisine} disabled={loading}>
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
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={loading} className="flex-1">
                  {loading ? (
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
                  <div className="flex gap-4 mt-3 text-sm">
                    <span>🍽️ {generatedRecipe.servings} porsi</span>
                    <span>⏱️ {generatedRecipe.prep_time + generatedRecipe.cook_time} menit</span>
                    <span>📊 {generatedRecipe.difficulty}</span>
                  </div>
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
