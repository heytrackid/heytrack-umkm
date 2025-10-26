'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TimePeriod } from '@/types/hpp-tracking'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, TrendingUp } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

// Import sub-components
import CostBreakdownChart from './CostBreakdownChart'
import { HPPAlertsList } from './HPPAlertsList'
import HPPComparisonCard from './HPPComparisonCard'
import HPPExportButton from './HPPExportButton'
import HPPHistoricalChart from './HPPHistoricalChart'
import HPPRecommendationsPanel from './HPPRecommendationsPanel'

interface HPPHistoricalTabProps {
    recipes: Array<{ id: string; name: string }>
    formatCurrency: (value: number) => string
    isMobile: boolean
}

export default function HPPHistoricalTab({
    recipes,
    formatCurrency,
    isMobile
}: HPPHistoricalTabProps) {
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
        recipes.length > 0 ? recipes[0].id : ''
    )
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')

    const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

    // Fetch comparison data
    const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
        queryKey: ['hpp-comparison', selectedRecipeId, selectedPeriod],
        queryFn: async () => {
            if (!selectedRecipeId) {return null}
            const response = await fetch(
                `/api/hpp/comparison?recipe_id=${selectedRecipeId}&period=${selectedPeriod}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch comparison data')
            }
            const result = await response.json()
            return result.data
        },
        enabled: !!selectedRecipeId
    })

    if (recipes.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Belum ada data resep. Silakan tambahkan resep terlebih dahulu di halaman Resep.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section with Recipe Selector and Export */}
            <Card>
                <CardContent className="pt-6">
                    <div className={cn(
                        "flex gap-4",
                        isMobile ? "flex-col" : "items-end justify-between"
                    )}>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="recipe-select">Pilih Produk</Label>
                            <Select
                                value={selectedRecipeId}
                                onValueChange={setSelectedRecipeId}
                            >
                                <SelectTrigger id="recipe-select" className={isMobile ? "w-full" : "w-[300px]"}>
                                    <SelectValue placeholder="Pilih produk..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {recipes.map(recipe => (
                                        <SelectItem key={recipe.id} value={recipe.id}>
                                            {recipe.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedRecipeId && selectedRecipe && (
                            <HPPExportButton
                                recipeId={selectedRecipeId}
                                recipeName={selectedRecipe.name}
                                period={selectedPeriod}
                                className={isMobile ? "w-full" : ""}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            {selectedRecipeId ? (
                <>
                    {/* Top Row: Comparison Card and Alerts */}
                    <div className={cn(
                        "grid gap-6",
                        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
                    )}>
                        <HPPComparisonCard
                            comparison={comparisonData}
                            loading={comparisonLoading}
                            recipeName={selectedRecipe?.name}
                            period={selectedPeriod}
                        />
                        <HPPAlertsList
                            recipeId={selectedRecipeId}
                            limit={5}
                        />
                    </div>

                    {/* Historical Chart */}
                    <HPPHistoricalChart
                        recipeId={selectedRecipeId}
                        recipeName={selectedRecipe?.name}
                    />

                    {/* Bottom Row: Cost Breakdown and Recommendations */}
                    <div className={cn(
                        "grid gap-6",
                        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
                    )}>
                        <CostBreakdownChart
                            recipeId={selectedRecipeId}
                            recipeName={selectedRecipe?.name}
                        />
                        <HPPRecommendationsPanel
                            recipeId={selectedRecipeId}
                        />
                    </div>

                    {/* Multi-Product Comparison Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Perbandingan Multi-Produk</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Bandingkan tren HPP hingga 5 produk sekaligus dalam satu grafik
                            </p>
                            <HPPHistoricalChart
                                recipes={recipes}
                                multiSelect={true}
                            />
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Pilih produk untuk melihat data historical HPP
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
