'use client'

import { ChevronRight, Clock, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import type { GeneratedRecipe } from './types'

interface RecipeHistoryEntry {
  id: string
  recipe: GeneratedRecipe
  timestamp: number
  params: {
    productName: string
    productType: string
    servings: number
  }
}

interface RecipeHistoryProps {
  onSelectRecipe: (recipe: GeneratedRecipe) => void
  onRestoreRecipe: (recipe: GeneratedRecipe) => void
  className?: string
}

const HISTORY_KEY = 'recipe_generation_history'
const MAX_HISTORY_ENTRIES = 20

/**
 * Save recipe to history
 */
export function saveToHistory(
  recipe: GeneratedRecipe,
  params: { productName: string; productType: string; servings: number }
): void {
  if (typeof window === 'undefined') return

  try {
    const history = getHistory()
    
    const entry: RecipeHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipe,
      timestamp: Date.now(),
      params
    }

    // Add to beginning, limit size
    const newHistory = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  } catch {
    // Silently fail
  }
}

/**
 * Get recipe history
 */
export function getHistory(): RecipeHistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Clear recipe history
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(HISTORY_KEY)
}

/**
 * Delete single history entry
 */
export function deleteHistoryEntry(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const history = getHistory()
    const newHistory = history.filter(entry => entry.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  } catch {
    // Silently fail
  }
}

export function RecipeHistory({
  onSelectRecipe,
  onRestoreRecipe,
  className
}: RecipeHistoryProps) {
  const [history, setHistory] = useState<RecipeHistoryEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      setHistory(getHistory())
    }
    loadHistory()
  }, [])

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id)
    setHistory(getHistory())
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const handleClearAll = () => {
    clearHistory()
    setHistory([])
    setSelectedId(null)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (history.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Riwayat Resep
          </CardTitle>
          <CardDescription>
            Belum ada resep yang di-generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Resep yang Anda generate akan muncul di sini</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Riwayat Resep
          </CardTitle>
          <CardDescription>
            {history.length} resep tersimpan
          </CardDescription>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus Semua
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Semua Riwayat?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus semua {history.length} resep dari riwayat. 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">
                Hapus Semua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'group p-3 rounded-lg border cursor-pointer transition-all',
                  'hover:bg-accent hover:border-primary/50',
                  selectedId === entry.id && 'bg-accent border-primary'
                )}
                onClick={() => {
                  setSelectedId(entry.id)
                  onSelectRecipe(entry.recipe)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{entry.recipe.name}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {entry.params.productType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{entry.recipe.servings} porsi</span>
                      <span>•</span>
                      <span>{entry.recipe.ingredients.length} bahan</span>
                      <span>•</span>
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRestoreRecipe(entry.recipe)
                      }}
                      title="Gunakan resep ini"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(entry.id)
                      }}
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
