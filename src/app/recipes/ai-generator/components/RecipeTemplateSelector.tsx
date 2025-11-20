'use client'

import { Sparkles, Clock, TrendingUp } from '@/components/icons'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import {
    RECIPE_CATEGORIES,
    getTemplatesByCategory,
    type RecipeTemplate
} from '@/lib/constants/recipe-templates'
import { getDifficultyColor, formatTime, getCategoryIcon } from '@/lib/utils/recipe-helpers'

/**
 * Recipe Template Selector
 * Sprint 1 Feature: Quick start with pre-made templates
 */

interface RecipeTemplateSelectorProps {
    onSelectTemplate: (template: RecipeTemplate) => void
    selectedTemplateId?: string
}

export const RecipeTemplateSelector = ({ onSelectTemplate, selectedTemplateId }: RecipeTemplateSelectorProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>(() => RECIPE_CATEGORIES[0] ?? 'bread')
    const { formatCurrency } = useCurrency()

    const getDifficultyLabel = (difficulty: string): string => {
        if (difficulty === 'easy') {return 'Mudah'}
        if (difficulty === 'medium') {return 'Sedang'}
        return 'Sulit'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                    Template Resep Siap Pakai
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Mulai cepat dengan template populer, tinggal generate!
                </p>
            </CardHeader>
            <CardContent>
                <SwipeableTabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SwipeableTabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
                        {RECIPE_CATEGORIES.map(category => (
                            <SwipeableTabsTrigger key={category} value={category} className="text-xs">
                                <span className="mr-1">{getCategoryIcon(category)}</span>
                                {category}
                            </SwipeableTabsTrigger>
                        ))}
                    </SwipeableTabsList>

                    {RECIPE_CATEGORIES.map(category => (
                        <SwipeableTabsContent key={category} value={category} className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {getTemplatesByCategory(category).map(template => (
                                    <Button
                                        key={template['id']}
                                        variant={selectedTemplateId === template['id'] ? 'default' : 'outline'}
                                        className="h-auto p-4 flex flex-col items-start gap-2"
                                        onClick={() => onSelectTemplate(template)}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-2xl">{template.icon}</span>
                                            <div className="flex-1 text-left">
                                                <div className="font-semibold text-sm">{template.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {template.description}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 w-full">
                                            <Badge variant="secondary" className="text-xs">
                                                {template.servings} porsi
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs ${getDifficultyColor(template.difficulty)}`}
                                            >
                                                {getDifficultyLabel(template.difficulty)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(template.prepTime + template.cookTime)}
                                            </div>
                                            <div className="flex items-center gap-1 font-semibold text-muted-foreground">
                                                <TrendingUp className="h-3 w-3" />
                                                ~{formatCurrency(template.estimatedHPP)}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </SwipeableTabsContent>
                    ))}
                </SwipeableTabs>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium">Tips:</div>
                            <div className="text-muted-foreground text-xs">
                                Pilih template yang mirip dengan produk yang mau kamu buat.
                                AI akan sesuaikan resep dengan bahan yang kamu punya! 🎯
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
