'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'

interface Recipe {
    id: string
    name: string
}

interface ProductSelectorProps {
    recipes: Recipe[]
    selectedRecipeIds: string[]
    visibleProducts: Set<string>
    onRecipeToggle: (recipeId: string) => void
    onVisibilityToggle: (recipeId: string) => void
    canSelectMore: boolean
}

export function ProductSelector({
    recipes,
    selectedRecipeIds,
    visibleProducts,
    onRecipeToggle,
    onVisibilityToggle,
    canSelectMore
}: ProductSelectorProps) {
    const { isMobile } = useResponsive()

    return (
        <div className="space-y-6">
            {/* Recipe Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Pilih Produk (Maksimal 5)</Label>
                <div className={cn(
                    "grid gap-3",
                    isMobile ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
                )}>
                    {recipes.slice(0, 10).map(recipe => (
                        <div key={recipe.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={recipe.id}
                                checked={selectedRecipeIds.includes(recipe.id)}
                                onCheckedChange={() => onRecipeToggle(recipe.id)}
                                disabled={!selectedRecipeIds.includes(recipe.id) && !canSelectMore}
                            />
                            <Label
                                htmlFor={recipe.id}
                                className="text-sm font-normal cursor-pointer"
                            >
                                {recipe.name}
                            </Label>
                        </div>
                    ))}
                </div>
                {!canSelectMore && (
                    <p className="text-xs text-muted-foreground">
                        Maksimal 5 produk dapat dipilih untuk perbandingan
                    </p>
                )}
            </div>

            {/* Visibility Toggle Buttons */}
            {selectedRecipeIds.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Tampilkan/Sembunyikan Produk</Label>
                    <div className="flex flex-wrap gap-2">
                        {selectedRecipeIds.map((recipeId, index) => {
                            const recipe = recipes.find(r => r.id === recipeId)
                            const isVisible = visibleProducts.has(recipeId)

                            return (
                                <Button
                                    key={recipeId}
                                    variant={isVisible ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onVisibilityToggle(recipeId)}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: isVisible
                                                ? MULTI_PRODUCT_COLORS[index % MULTI_PRODUCT_COLORS.length]
                                                : '#9ca3af'
                                        }}
                                    />
                                    {recipe?.name || recipeId}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// Colors for multi-product comparison (duplicated from chartUtils for component isolation)
const MULTI_PRODUCT_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#8b5cf6'  // purple
]
