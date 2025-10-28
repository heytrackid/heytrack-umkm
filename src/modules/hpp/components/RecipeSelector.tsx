'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Package } from 'lucide-react'

interface Recipe {
    id: string
    name: string
}

interface RecipeSelectorProps {
    recipes: Recipe[]
    selectedRecipeId: string
    onRecipeSelect: (recipeId: string) => void
    isLoading?: boolean
}

export const RecipeSelector = ({ recipes, selectedRecipeId, onRecipeSelect, isLoading }: RecipeSelectorProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pilih Produk
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Select value={selectedRecipeId} onValueChange={onRecipeSelect} disabled={isLoading}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih produk yang ingin dihitung..." />
                </SelectTrigger>
                <SelectContent>
                    {recipes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                            {r.name}
                        </SelectItem>
                    ))}
                    <SelectItem value="new">+ Buat Produk Baru</SelectItem>
                </SelectContent>
            </Select>

            {isLoading && (
                <div className="flex items-center justify-center py-4 mt-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </CardContent>
    </Card>
)
