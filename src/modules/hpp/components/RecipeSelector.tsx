'use client'

import { Package } from '@/components/icons'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import type { Row } from '@/types/database'



type Recipe = Row<'recipes'>

interface RecipeSelectorProps {
    recipes: Array<Pick<Recipe, 'id' | 'name'>>
    selectedRecipeId: string
    onRecipeSelect: (recipeId: string) => void
    isLoading?: boolean
}

export const RecipeSelector = ({ recipes, selectedRecipeId, onRecipeSelect, isLoading }: RecipeSelectorProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pilih Produk ({recipes?.length || 0} produk tersedia)
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Select value={selectedRecipeId} onValueChange={onRecipeSelect} {...(isLoading && { disabled: isLoading })}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih produk yang ingin dihitung..." />
                </SelectTrigger>
                <SelectContent>
                    {(recipes || []).map((r) => (
                        <SelectItem key={r['id']} value={r['id']}>
                            {r.name}
                        </SelectItem>
                    ))}
                    <SelectItem value="new">+ Buat Produk Baru</SelectItem>
                </SelectContent>
            </Select>

            {isLoading && (
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                </div>
            )}
        </CardContent>
    </Card>
)
