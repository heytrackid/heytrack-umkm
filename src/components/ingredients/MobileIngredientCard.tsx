'use client'

import { useState } from 'react'
import type { IngredientsTable } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/settings-context'
import { StockBadge, CompactStockIndicator } from './StockBadge'
import { cn } from '@/lib/utils'
import {
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    ShoppingCart
} from 'lucide-react'

type Ingredient = IngredientsTable

interface MobileIngredientCardProps {
    ingredient: Ingredient
    onView?: (ingredient: Ingredient) => void
    onEdit?: (ingredient: Ingredient) => void
    onDelete?: (ingredient: Ingredient) => void
    onQuickBuy?: (ingredient: Ingredient) => void
}

/**
 * Mobile-Optimized Ingredient Card
 * 
 * Features:
 * - Compact view with essential info
 * - Expandable for full details
 * - Stock status badge
 * - Quick actions
 * - Swipe-friendly design
 */
export const MobileIngredientCard = ({
    ingredient,
    onView: _onView,
    onEdit,
    onDelete,
    onQuickBuy
}: MobileIngredientCardProps) => {
    const { formatCurrency } = useSettings()
    const [isExpanded, setIsExpanded] = useState(false)

    const isLowStock = (ingredient.current_stock ?? 0) <= (ingredient.min_stock ?? 0)
    const isOutOfStock = (ingredient.current_stock ?? 0) <= 0
    const totalValue = (ingredient.price_per_unit ?? 0) * (ingredient.current_stock ?? 0)

    return (
        <Card className={cn(
            'border transition-all',
            isOutOfStock && 'border-red-200 bg-red-50/30',
            isLowStock && !isOutOfStock && 'border-yellow-200 bg-yellow-50/30'
        )}>
            <CardContent className="p-4">
                {/* Header - Always Visible */}
                <div className="space-y-3">
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base break-words">
                                {ingredient.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {formatCurrency(ingredient.price_per_unit || 0)}/{ingredient.unit || ''}
                            </p>
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
                        <div className="pt-3 border-t space-y-3 animate-in slide-in-from-top-2">
                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Stok Minimum</p>
                                    <p className="font-medium">
                                        {ingredient.min_stock ?? 0} {ingredient.unit ?? ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Total Nilai</p>
                                    <p className="font-medium">
                                        {formatCurrency(totalValue)}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {ingredient.description && (
                                <div className="text-sm">
                                    <p className="text-muted-foreground mb-1">Deskripsi</p>
                                    <p className="text-gray-700">{ingredient.description}</p>
                                </div>
                            )}

                            {/* Low Stock Alert */}
                            {isLowStock && !isOutOfStock && (
                                <div className="p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                                    ⚠️ Stok mencapai batas minimum
                                </div>
                            )}

                            {isOutOfStock && (
                                <div className="p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                                    ❌ Stok habis! Segera lakukan pembelian
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        {/* Quick Buy for Low Stock */}
                        {isLowStock && onQuickBuy && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => onQuickBuy(ingredient)}
                                className="flex-1"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Beli
                            </Button>
                        )}

                        {/* Standard Actions */}
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(ingredient)}
                                className={cn('flex-1', isLowStock && 'flex-none')}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}

                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(ingredient)}
                                className="flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Mobile Ingredient List
 * Wrapper for multiple cards with optimizations
 */
interface MobileIngredientListProps {
    ingredients: Ingredient[]
    onView?: (ingredient: Ingredient) => void
    onEdit?: (ingredient: Ingredient) => void
    onDelete?: (ingredient: Ingredient) => void
    onQuickBuy?: (ingredient: Ingredient) => void
}

export const MobileIngredientList = ({
    ingredients,
    onView,
    onEdit,
    onDelete,
    onQuickBuy
}: MobileIngredientListProps) => (
    <div className="space-y-3">
        {ingredients.map((ingredient) => (
            <MobileIngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickBuy={onQuickBuy}
            />
        ))}
    </div>
)
