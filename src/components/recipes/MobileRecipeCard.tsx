 
'use client'

import { Calculator, Clock, Edit, Eye, MoreVertical, Trash2, Users } from 'lucide-react'

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

import type { Row } from '@/types/database'

type Recipe = Row<'recipes'>

interface MobileRecipeCardProps {
    recipe: Recipe
    onView: (recipe: Recipe) => void
    onEdit: (recipe: Recipe) => void
    onDelete: (recipe: Recipe) => void
    onCalculateHPP: (recipe: Recipe) => void
    getCategoryIcon: (category: string) => string
    getDifficultyColor: (difficulty: string) => string
    getDifficultyLabel: (difficulty: string) => string
}

export const MobileRecipeCard = ({
    recipe,
    onView,
    onEdit,
    onDelete,
    onCalculateHPP,
    getCategoryIcon,
    getDifficultyColor,
    getDifficultyLabel,
}: MobileRecipeCardProps) => (
    <Card className="transition-all" onClick={() => onView(recipe)}>
        <CardContent className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{getCategoryIcon(recipe.category ?? 'other')}</span>
                            <h3 className="font-semibold">{recipe.name}</h3>
                        </div>
                        {recipe.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {recipe.description}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.stopPropagation()
                                onView(recipe)
                            }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.stopPropagation()
                                onEdit(recipe)
                            }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                onCalculateHPP(recipe)
                            }}>
                                <Calculator className="h-4 w-4 mr-2" />
                                Hitung HPP
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
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
                    <Badge className={getDifficultyColor(recipe.difficulty ?? 'medium')}>
                        {getDifficultyLabel(recipe.difficulty ?? 'medium')}
                    </Badge>
                </div>
            </div>
        </CardContent>
    </Card>
)

