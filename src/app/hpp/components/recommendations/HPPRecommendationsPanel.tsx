'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'
import { useRecommendationsData } from './useRecommendationsData'
import { useExpandedState } from './useExpandedState'
import { LoadingState, ErrorState, EmptyState } from './RecommendationStates'
import { RecommendationItem } from './RecommendationItem'
import { PotentialSavingsSummary } from './PotentialSavingsSummary'

interface HPPRecommendationsPanelProps {
    recipeId?: string
    isMobile?: boolean
}

export function HPPRecommendationsPanel({ recipeId, isMobile }: HPPRecommendationsPanelProps) {
    const { recommendations, totalPotentialSavings, isLoading, error } = useRecommendationsData({
        recipeId
    })
    const { expandedIds, toggleExpanded } = useExpandedState()

    if (isLoading) {
        return <LoadingState />
    }

    if (error) {
        return <ErrorState />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Rekomendasi Optimasi
                </CardTitle>
                <CardDescription>
                    {recommendations.length > 0
                        ? `${recommendations.length} rekomendasi untuk meningkatkan efisiensi dan profitabilitas`
                        : 'Saran untuk meningkatkan efisiensi dan profitabilitas'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {recommendations.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">
                        {/* Total Potential Savings Summary */}
                        <PotentialSavingsSummary totalPotentialSavings={totalPotentialSavings} />

                        {/* Recommendations List */}
                        <div className="space-y-3">
                            {recommendations.map((recommendation, index) => {
                                const uniqueId = `${recommendation.recipe_id}-${recommendation.type}-${index}`
                                const isExpanded = expandedIds.has(uniqueId)

                                return (
                                    <RecommendationItem
                                        key={uniqueId}
                                        recommendation={recommendation}
                                        uniqueId={uniqueId}
                                        isExpanded={isExpanded}
                                        onToggle={() => toggleExpanded(uniqueId)}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default HPPRecommendationsPanel
