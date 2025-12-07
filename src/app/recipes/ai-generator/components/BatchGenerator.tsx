'use client'

import { CheckCircle2, Loader2, Play, Plus, Trash2, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { BatchGenerationResult, GenerateRecipeParams } from '@/hooks/api/useAIRecipeEnhanced'

interface BatchItem {
  id: string
  params: Partial<GenerateRecipeParams>
  status: 'pending' | 'generating' | 'success' | 'error'
  error?: string | undefined
}

interface BatchGeneratorProps {
  availableIngredients: string[]
  onGenerateBatch: (paramsList: GenerateRecipeParams[]) => Promise<BatchGenerationResult>
  isGenerating: boolean
  className?: string
}

const productTypes = [
  { value: 'bread', label: 'Roti' },
  { value: 'cake', label: 'Kue' },
  { value: 'pastry', label: 'Pastry' },
  { value: 'cookies', label: 'Cookies' },
  { value: 'donuts', label: 'Donat' },
  { value: 'other', label: 'Lainnya' }
]

export function BatchGenerator({
  availableIngredients: _availableIngredients,
  onGenerateBatch,
  isGenerating,
  className
}: BatchGeneratorProps) {
  // Note: availableIngredients can be used for ingredient suggestions in future
  void _availableIngredients
  const [items, setItems] = useState<BatchItem[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [results, setResults] = useState<BatchGenerationResult | null>(null)

  const addItem = () => {
    const newItem: BatchItem = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      params: {
        name: '',
        type: 'bread',
        servings: 12,
        preferredIngredients: [],
        customIngredients: [],
        dietaryRestrictions: []
      },
      status: 'pending'
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<BatchItem['params']>) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, params: { ...item.params, ...updates } }
        : item
    ))
  }

  const handleGenerate = async () => {
    // Validate all items
    const validItems = items.filter(item => 
      item.params.name && item.params.name.length >= 3
    )

    if (validItems.length === 0) {
      return
    }

    // Reset statuses
    setItems(items.map(item => ({ ...item, status: 'pending' as const })))
    setResults(null)

    // Build params list
    const paramsList: GenerateRecipeParams[] = validItems.map(item => ({
      name: item.params.name!,
      type: item.params.type || 'bread',
      servings: item.params.servings || 12,
      preferredIngredients: item.params.preferredIngredients || [],
      customIngredients: item.params.customIngredients || [],
      dietaryRestrictions: item.params.dietaryRestrictions || []
    }))

    // Update progress as generation proceeds
    const updateProgress = (index: number) => {
      setCurrentProgress(Math.round((index / paramsList.length) * 100))
      setItems(prev => prev.map((item, i) => ({
        ...item,
        status: i < index ? 'success' : i === index ? 'generating' : 'pending'
      })))
    }

    // Start generation
    for (let i = 0; i < paramsList.length; i++) {
      updateProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UI update
    }

    const result = await onGenerateBatch(paramsList)
    setResults(result)
    setCurrentProgress(100)

    // Update final statuses
    setItems(prev => prev.map((item) => {
      const failed = result.failed.find(f => f.params.name === item.params.name)
      return {
        ...item,
        status: failed ? 'error' as const : 'success' as const,
        error: failed?.error ?? undefined
      }
    }))
  }

  const validCount = items.filter(item => item.params.name && item.params.name.length >= 3).length

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Batch Generator
        </CardTitle>
        <CardDescription>
          Generate beberapa resep sekaligus untuk efisiensi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items list */}
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'p-3 rounded-lg border space-y-3',
                  item.status === 'generating' && 'border-primary bg-primary/5',
                  item.status === 'success' && 'border-green-500 bg-green-50',
                  item.status === 'error' && 'border-red-500 bg-red-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    {item.status === 'generating' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {item.status === 'error' && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeItem(item.id)}
                    disabled={isGenerating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Nama Produk</Label>
                    <Input
                      placeholder="Contoh: Roti Sobek Coklat"
                      value={item.params.name || ''}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      disabled={isGenerating}
                      className={cn(
                        'mt-1',
                        item.params.name && item.params.name.length < 3 && 'border-amber-500'
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tipe</Label>
                    <Select
                      value={item.params.type || 'bread'}
                      onValueChange={(value) => updateItem(item.id, { type: value })}
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {item.error && (
                  <p className="text-xs text-red-600">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Add button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={addItem}
          disabled={isGenerating || items.length >= 10}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Resep ({items.length}/10)
        </Button>

        {/* Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <Progress value={currentProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Generating... {currentProgress}%
            </p>
          </div>
        )}

        {/* Results summary */}
        {results && (
          <div className="p-3 rounded-lg bg-muted space-y-2">
            <h4 className="font-medium text-sm">Hasil Batch Generation</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">
                ✓ {results.successful.length} berhasil
              </span>
              {results.failed.length > 0 && (
                <span className="text-red-600">
                  ✗ {results.failed.length} gagal
                </span>
              )}
            </div>
          </div>
        )}

        {/* Generate button */}
        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating || validCount === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate {validCount} Resep
            </>
          )}
        </Button>

        {items.length > 0 && validCount < items.length && (
          <p className="text-xs text-amber-600 text-center">
            {items.length - validCount} item belum valid (nama minimal 3 karakter)
          </p>
        )}
      </CardContent>
    </Card>
  )
}
