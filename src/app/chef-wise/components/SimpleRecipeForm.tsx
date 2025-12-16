'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BUTTON_TEXTS, FORM_LABELS, LOADING_TEXTS } from '@/lib/shared'
import { Clock, DollarSign, Sparkles, Utensils } from 'lucide-react'
import { useState } from 'react'

interface SimpleRecipeFormProps {
  onSubmit: (data: { prompt: string; servings: number }) => void
  isLoading?: boolean
}

export default function SimpleRecipeForm({ onSubmit, isLoading = false }: SimpleRecipeFormProps) {
  const [prompt, setPrompt] = useState('')
  const [servings, setServings] = useState(4)

  const examplePrompts = [
    {
      title: 'Menu Harian',
      description: 'Buat menu makan siang dan malam untuk hari ini',
      icon: Utensils,
      prompt: 'Saya mau buat menu makan siang dan malam untuk hari ini, untuk 4 orang, yang praktis dan bergizi'
    },
    {
      title: 'Budget Friendly',
      description: 'Resep hemat dengan bahan tersedia',
      icon: DollarSign,
      prompt: 'Saya mau resep yang hemat biaya, menggunakan bahan yang umum tersedia di pasar, untuk 4 orang'
    },
    {
      title: 'Quick & Easy',
      description: 'Resep cepat < 30 menit',
      icon: Clock,
      prompt: 'Saya mau resep yang cepat dan mudah dibuat, maksimal 30 menit, untuk 4 orang'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit({ prompt: prompt.trim(), servings })
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  return (
    <div className="space-y-6">
      {/* Example Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Contoh Permintaan
          </CardTitle>
          <CardDescription>
            Klik untuk menggunakan template, atau tulis permintaan Anda sendiri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {examplePrompts.map((example) => (
              <Button
                key={example.title}
                type="button"
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/10 text-left"
                onClick={() => handleExampleClick(example.prompt)}
              >
                <example.icon className="h-6 w-6" />
                <span className="font-medium">{example.title}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {example.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simple Form */}
      <Card>
        <CardHeader>
          <CardTitle>Buat Resep dengan AI</CardTitle>
          <CardDescription>
            Jelaskan resep yang Anda inginkan, AI akan membantu membuatnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.DESCRIPTION}</label>
              <Textarea
                className="w-full p-3 border rounded-md resize-none min-h-[120px]"
                placeholder="Apa yang ingin kamu masak? Ceritakan detailnya..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.SERVINGS}</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="w-full sm:w-32"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={!prompt.trim() || isLoading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? LOADING_TEXTS.GENERATING_RECIPE : BUTTON_TEXTS.GENERATE + ' Resep'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
