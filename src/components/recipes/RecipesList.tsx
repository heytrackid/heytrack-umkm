'use client'

import { Calculator, Clock, Edit, MoreVertical, Plus, Sparkles, Trash2, Users } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { RecipeFormDialog } from '@/components/recipes/RecipeFormDialog'
import { RecipeStatsCards } from '@/components/recipes/RecipeStatsCards'
import { SharedDataTable, type Column } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BreadcrumbPatterns, DeleteModal, PageBreadcrumb } from '@/components/ui/index'
import { toast } from '@/components/ui/toast'
import { useDeleteRecipe, useRecipes } from '@/hooks/useRecipes'
import { handleError } from '@/lib/error-handling'

import type { Recipe } from '@/types/database'

const getDifficultyColor = (difficulty: string | null | undefined): string => {
  switch (difficulty ?? 'medium') {
    case 'easy': return 'bg-muted text-muted-foreground'
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

const getDifficultyLabel = (difficulty: string | null | undefined): string => {
  switch (difficulty ?? 'medium') {
    case 'easy': return 'Mudah'
    case 'medium': return 'Sedang'
    case 'hard': return 'Sulit'
    default: return difficulty ?? 'Sedang'
  }
}

const RecipesListComponent = (): JSX.Element => {
  const router = useRouter()
  const { data: recipesData = [], isLoading, refetch } = useRecipes()
  const deleteRecipeMutation = useDeleteRecipe()

  const recipes = useMemo(() => {
    if (!recipesData || !Array.isArray(recipesData)) return []
    return recipesData.filter((r): r is Recipe => r.is_active ?? false)
  }, [recipesData])

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined)

  // Handlers
  const handleView = useCallback((recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`)
  }, [router])

  const handleAdd = useCallback(() => {
    setEditingRecipe(undefined)
    setShowAddDialog(true)
  }, [])

  const handleEdit = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowAddDialog(true)
  }, [])

  const handleDelete = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleCalculateHPP = useCallback((recipe: Recipe) => {
    router.push(`/hpp?recipe=${recipe.id}`)
  }, [router])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRecipe) return
    try {
      await deleteRecipeMutation.mutateAsync(selectedRecipe.id)
      toast({ title: `${selectedRecipe.name} dihapus`, description: 'Resep telah dihapus dari sistem', type: 'success' })
      setIsDeleteDialogOpen(false)
      setSelectedRecipe(null)
    } catch (error) {
      handleError(error as Error, 'Recipes List: delete recipe', true, 'Gagal menghapus resep')
    }
  }, [selectedRecipe, deleteRecipeMutation])

  // Column definitions for table mode
  const columns: Array<Column<Recipe>> = useMemo(() => [
    {
      key: 'name',
      header: 'Nama Resep',
      render: (_, recipe) => (
        <div>
          <span className="font-semibold">{recipe.name}</span>
          {recipe.description && <p className="text-xs text-muted-foreground line-clamp-1">{recipe.description}</p>}
        </div>
      )
    },
    {
      key: 'servings',
      header: 'Porsi',
      render: (_, recipe) => <span>{recipe.servings} porsi</span>
    },
    {
      key: 'prep_time',
      header: 'Waktu',
      render: (_, recipe) => <span>{(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} menit</span>
    },
    {
      key: 'difficulty',
      header: 'Kesulitan',
      filterable: true,
      filterOptions: [
        { label: 'Mudah', value: 'easy' },
        { label: 'Sedang', value: 'medium' },
        { label: 'Sulit', value: 'hard' }
      ],
      render: (_, recipe) => (
        <Badge className={getDifficultyColor(recipe.difficulty)}>
          {getDifficultyLabel(recipe.difficulty)}
        </Badge>
      )
    }
  ], [])

  // Card renderer for card mode
  const cardRenderer = useCallback((recipe: Recipe, actions: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) => (
    <Card className="transition-all cursor-pointer hover:shadow-md" onClick={actions.onView}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{recipe.name}</h3>
              {recipe.description && <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); actions.onEdit?.() }}>
                  <Edit className="h-4 w-4 mr-2" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleCalculateHPP(recipe) }}>
                  <Calculator className="h-4 w-4 mr-2" />Hitung HPP
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); actions.onDelete?.() }} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />{recipe.servings} porsi
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} menit
            </Badge>
            <Badge className={getDifficultyColor(recipe.difficulty)}>{getDifficultyLabel(recipe.difficulty)}</Badge>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={(e: React.MouseEvent) => { e.stopPropagation(); actions.onEdit?.() }} className="flex-1">
              <Edit className="h-3 w-3 mr-1" />Edit
            </Button>
            <Button size="sm" variant="outline" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleCalculateHPP(recipe) }} className="flex-1">
              <Calculator className="h-3 w-3 mr-1" />HPP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [handleCalculateHPP])

  return (
    <div className="space-y-6">
      <PageBreadcrumb items={BreadcrumbPatterns.recipes} />

      <PageHeader
        title="Resep Produk"
        description="Kelola resep dan hitung HPP dengan sistem otomatis"
        action={
          <div className="flex gap-2">
            <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Resep Baru</Button>
            <Button variant="outline" onClick={() => router.push('/recipes/ai-generator')}>
              <Sparkles className="h-4 w-4 mr-2" />AI Generator
            </Button>
          </div>
        }
      />

      <RecipeStatsCards recipes={recipes} />

      <SharedDataTable
        data={recipes}
        columns={columns}
        loading={isLoading}
        displayMode="cards"
        allowViewToggle={true}
        cardRenderer={cardRenderer}
        cardsPerRow={3}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => void refetch()}
        onAdd={handleAdd}
        addButtonText="Resep Baru"
        searchPlaceholder="Cari resep..."
        emptyMessage="Belum Ada Resep"
        emptyDescription="Buat resep produk Anda untuk mulai menghitung HPP dan mengelola produksi."
        pageSizeOptions={[12, 24, 48, 96]}
        sortOptions={[
          { label: 'Terbaru', value: 'created_at', direction: 'desc' },
          { label: 'Terlama', value: 'created_at', direction: 'asc' },
          { label: 'Nama A-Z', value: 'name', direction: 'asc' },
          { label: 'Nama Z-A', value: 'name', direction: 'desc' },
          { label: 'Porsi Terbanyak', value: 'servings', direction: 'desc' },
          { label: 'Porsi Tersedikit', value: 'servings', direction: 'asc' },
        ]}
        defaultSort="created_at"
        customActions={[
          { label: 'Hitung HPP', icon: Calculator, onClick: handleCalculateHPP }
        ]}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedRecipe(null) }}
        onConfirm={handleConfirmDelete}
        entityName="Resep"
        itemName={selectedRecipe?.name ?? ''}
      />

      <RecipeFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        recipe={editingRecipe}
        onSuccess={() => void refetch()}
      />
    </div>
  )
}

export const RecipesList = memo(RecipesListComponent)
