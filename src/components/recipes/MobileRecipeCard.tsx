 
'use client'

import { Calculator, Clock, DollarSign, Edit, Eye, MoreVertical, Trash2, Users } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { Recipe } from '@/types/database'

interface RecipeCostPreview {
    materialCost: number
    costPerServing: number
    ingredientsCount: number
}

interface MobileRecipeCardProps {
    recipe: Recipe
    costPreview?: RecipeCostPreview | null
    onView: (recipe: Recipe) => void
    onEdit: (recipe: Recipe) => void
    onDelete: (recipe: Recipe) => void
    onCalculateHPP: (recipe: Recipe) => void
    getDifficultyColor: (difficulty: string | null | undefined) => string
    getDifficultyLabel: (difficulty: string | null | undefined) => string
}

export const MobileRecipeCard = ({
    recipe,
    costPreview,
    onView,
    onEdit,
    onDelete,
    onCalculateHPP,
    getDifficultyColor,
    getDifficultyLabel,
}: MobileRecipeCardProps): JSX.Element => {
    const { formatCurrency } = useSettings()

    return (
        <Card className="transition-all" onClick={(): void => {
            onView(recipe)
        }}>
            <CardContent className="p-4">
                <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">

                            <h3 className="font-semibold">{recipe.name}</h3>
                        </div>
                        {recipe.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {recipe.description}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
                            e.stopPropagation()
                        }}>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                e.stopPropagation()
                                onView(recipe)
                            }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                e.stopPropagation()
                                onEdit(recipe)
                            }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                e.stopPropagation()
                                onCalculateHPP(recipe)
                            }}>
                                <Calculator className="h-4 w-4 mr-2" />
                                Hitung HPP
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                    e.stopPropagation()
                                    onDelete(recipe)
                                }}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                    {/* Info Badges */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings} porsi
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} menit
                        </Badge>
                        {costPreview && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(costPreview.costPerServing)}/porsi
                            </Badge>
                        )}
                        <Badge className={getDifficultyColor(recipe.difficulty ?? 'medium')}>
                            {getDifficultyLabel(recipe.difficulty ?? 'medium')}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

