'use client'

import {
    ChevronDown,
    ChevronUp,
    ShoppingCart,
    Package
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QuickStockAdjustment } from '@/components/ui/quick-stock-adjustment'
import { SwipeableCard, SwipeActions } from '@/components/ui/swipeable-card'
import { useSettings } from '@/contexts/settings-context'
import { animations } from '@/lib/animations'
import { cn } from '@/lib/utils'

import type { Row } from '@/types/database'

import { StockBadge, CompactStockIndicator } from './StockBadge'


type Ingredient = Row<'ingredients'>

interface EnhancedMobileIngredientCardProps {
    ingredient: Ingredient
    onEdit?: (ingredient: Ingredient) => void
    onDelete?: (ingredient: Ingredient) => void
    onQuickBuy?: (ingredient: Ingredient) => void
    onStockAdjust?: (ingredient: Ingredient, newStock: number, adjustment: number) => Promise<void>
    enableSwipe?: boolean
    showQuickAdjust?: boolean
}

export const EnhancedMobileIngredientCard = ({
    ingredient,
    onEdit,
    onDelete,
    onQuickBuy,
    onStockAdjust,
    enableSwipe = true,
    showQuickAdjust = false
}: EnhancedMobileIngredientCardProps) => {
    const { formatCurrency } = useSettings()
    const [isExpanded, setIsExpanded] = useState(false)
    const [showStockAdjust, setShowStockAdjust] = useState(showQuickAdjust)

    const isLowStock = (ingredient.current_stock ?? 0) <= (ingredient.min_stock ?? 0)
    const isOutOfStock = (ingredient.current_stock ?? 0) <= 0
    const totalValue = (ingredient.price_per_unit ?? 0) * (ingredient.current_stock ?? 0)

    const swipeActions = enableSwipe ? [
        SwipeActions.edit(() => onEdit?.(ingredient)),
        SwipeActions.delete(() => onDelete?.(ingredient))
    ] : []

    const cardContent = (
        <Card className={cn(
            'border transition-all',
            animations.smooth,
            isOutOfStock && 'border-red-200 bg-red-50/30',
            isLowStock && !isOutOfStock && 'border-yellow-200 bg-yellow-50/30'
        )}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base break-words">
                                {ingredient.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {formatCurrency(ingredient.price_per_unit || 0)}/{ingredient.unit || ''}
                            </p>
                            {ingredient.category && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {ingredient.category}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Stock Indicator */}
                    <div className="flex items-center justify-between">
                        <CompactStockIndicator
                            currentStock={ingredient.current_stock ?? 0}
                            minStock={ingredient.min_stock ?? 0}
                            unit={ingredient.unit || ''}
                        />
                        <StockBadge
                            currentStock={ingredient.current_stock ?? 0}
                            minStock={ingredient.min_stock ?? 0}
                            unit={ingredient.unit || ''}
                            compact
                            showIcon={false}
                        />
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className={cn('space-y-3 pt-3 border-t', animations.fadeInDown)}>
                            {/* Stock Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Stok Minimum</p>
                                    <p className="font-medium">{ingredient.min_stock ?? 0} {ingredient.unit}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total Nilai</p>
                                    <p className="font-medium">{formatCurrency(totalValue)}</p>
                                </div>
                            </div>

                            {/* Supplier Info */}
                            {ingredient.supplier && (
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Supplier</p>
                                    <p className="font-medium">{ingredient.supplier}</p>
                                </div>
                            )}

                            {/* Quick Stock Adjustment */}
                            {showStockAdjust && onStockAdjust && (
                                <div className={cn('pt-2 border-t', animations.fadeIn)}>
                                    <QuickStockAdjustment
                                        currentStock={ingredient.current_stock ?? 0}
                                        unit={ingredient.unit || ''}
                                        onAdjust={(newStock, adjustment) => 
                                            onStockAdjust(ingredient, newStock, adjustment)
                                        }
                                        quickAmounts={[10, 50, 100]}
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                {onQuickBuy && isLowStock && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onQuickBuy(ingredient)}
                                        className="w-full"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Reorder
                                    </Button>
                                )}
                                {!showStockAdjust && onStockAdjust && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowStockAdjust(!showStockAdjust)}
                                        className="w-full"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Adjust Stok
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    // Wrap with swipeable if enabled
    if (enableSwipe && swipeActions.length > 0) {
        return (
            <SwipeableCard actions={swipeActions} threshold={80}>
                {cardContent}
            </SwipeableCard>
        )
    }

    return cardContent
}

// List component with stagger animation
interface EnhancedMobileIngredientListProps {
    ingredients: Ingredient[]
    onEdit?: (ingredient: Ingredient) => void
    onDelete?: (ingredient: Ingredient) => void
    onQuickBuy?: (ingredient: Ingredient) => void
    onStockAdjust?: (ingredient: Ingredient, newStock: number, adjustment: number) => Promise<void>
    enableSwipe?: boolean
    showQuickAdjust?: boolean
}

export const EnhancedMobileIngredientList = ({
    ingredients,
    onEdit,
    onDelete,
    onQuickBuy,
    onStockAdjust,
    enableSwipe = true,
    showQuickAdjust = false
}: EnhancedMobileIngredientListProps) => (
        <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
                <div
                    key={ingredient['id']}
                    className={animations.fadeInUp}
                    style={animations.stagger(index, 30)}
                >
                    <EnhancedMobileIngredientCard
                        ingredient={ingredient}
                        {...(onEdit ? { onEdit } : {})}
                        {...(onDelete ? { onDelete } : {})}
                        {...(onQuickBuy ? { onQuickBuy } : {})}
                        {...(onStockAdjust ? { onStockAdjust } : {})}
                        {...(enableSwipe !== undefined ? { enableSwipe } : {})}
                        {...(showQuickAdjust !== undefined ? { showQuickAdjust } : {})}
                    />
                </div>
            ))}
        </div>
    )
