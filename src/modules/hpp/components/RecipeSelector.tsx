'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Loader2 } from 'lucide-react'

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
                <CardTitle className="flex items-center gap-2">
                    🎯 Langkah 1: Pilih Produk
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Pilih produk yang mau dihitung biaya dan harga jualnya</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={selectedRecipeId} onValueChange={onRecipeSelect}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih produk yang mau dihitung..." />
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
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
