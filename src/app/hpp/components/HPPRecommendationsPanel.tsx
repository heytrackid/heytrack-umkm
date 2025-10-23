'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/hooks/useCurrency'
import { HPPRecommendation } from '@/types/hpp-tracking'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, DollarSign, Lightbulb, Package, TrendingUp, Users } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

interface HPPRecommendationsPanelProps {
    recipeId?: string
}

interface RecommendationsResponse {
    success: boolean
    data: Array<HPPRecommendation & { recipe_id: string; recipe_name: string }>
    meta: {
        total_recommendations: number
        recipes_analyzed: number
    }
}

// Helper function to get priority badge variant
const getPriorityConfig = (priority: HPPRecommendation['priority']) => {
    switch (priority) {
        case 'high':
            return {
                variant: 'destructive' as const,
                label: 'Prioritas Tinggi',
                color: 'text-red-600 dark:text-red-500'
            }
        case 'medium':
            return {
                variant: 'default' as const,
                label: 'Prioritas Sedang',
                color: 'text-yellow-600 dark:text-yellow-500'
            }
        case 'low':
            return {
                variant: 'secondary' as const,
                label: 'Prioritas Rendah',
                color: 'text-blue-600 dark:text-blue-500'
            }
    }
}

// Helper function to get recommendation type icon and label
const getTypeConfig = (type: HPPRecommendation['type']) => {
    switch (type) {
        case 'supplier_review':
            return {
                icon: Users,
                label: 'Review Supplier',
                color: 'text-purple-600 dark:text-purple-500'
            }
        case 'ingredient_alternative':
            return {
                icon: Package,
                label: 'Alternatif Bahan',
                color: 'text-blue-600 dark:text-blue-500'
            }
        case 'operational_efficiency':
            return {
                icon: TrendingUp,
                label: 'Efisiensi Operasional',
                color: 'text-green-600 dark:text-green-500'
            }
        case 'price_adjustment':
            return {
                icon: DollarSign,
                label: 'Penyesuaian Harga',
                color: 'text-orange-600 dark:text-orange-500'
            }
    }
}

export function HPPRecommendationsPanel({ recipeId }: HPPRecommendationsPanelProps) {
    const { formatCurrency } = useCurrency()
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    // Fetch recommendations
    const { data, isLoading, error } = useQuery<RecommendationsResponse>({
        queryKey: ['hpp-recommendations', recipeId],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (recipeId) {
                params.append('recipe_id', recipeId)
            }
            const response = await fetch(`/api/hpp/recommendations?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations')
            }
            return response.json()
        },
        refetchInterval: 300000 // Refetch every 5 minutes
    })

    const toggleExpanded = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Rekomendasi Optimasi
                    </CardTitle>
                    <CardDescription>Saran untuk meningkatkan efisiensi dan profitabilitas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Rekomendasi Optimasi
                    </CardTitle>
                    <CardDescription>Saran untuk meningkatkan efisiensi dan profitabilitas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Gagal memuat rekomendasi</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const recommendations = data?.data || []
    const totalPotentialSavings = recommendations.reduce(
        (sum, rec) => sum + (rec.potential_savings || 0),
        0
    )

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
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p className="font-medium">Tidak ada rekomendasi saat ini</p>
                        <p className="text-sm mt-2">
                            HPP produk Anda sudah optimal. Terus pantau untuk perubahan di masa depan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Total Potential Savings Summary */}
                        {totalPotentialSavings > 0 && (
                            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                            Potensi Penghematan Total
                                        </p>
                                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                            Jika semua rekomendasi diterapkan
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                                        {formatCurrency(totalPotentialSavings)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Recommendations List */}
                        <div className="space-y-3">
                            {recommendations.map((recommendation, index) => {
                                const uniqueId = `${recommendation.recipe_id}-${recommendation.type}-${index}`
                                const isExpanded = expandedIds.has(uniqueId)
                                const priorityConfig = getPriorityConfig(recommendation.priority)
                                const typeConfig = getTypeConfig(recommendation.type)
                                const TypeIcon = typeConfig.icon

                                return (
                                    <Collapsible
                                        key={uniqueId}
                                        open={isExpanded}
                                        onOpenChange={() => toggleExpanded(uniqueId)}
                                    >
                                        <div className="border rounded-lg overflow-hidden">
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full p-4 h-auto hover:bg-accent/50"
                                                >
                                                    <div className="flex items-start justify-between w-full gap-3">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0 text-left">
                                                            <div className="mt-0.5">
                                                                <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0 space-y-2">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className="font-medium text-sm">
                                                                        {recommendation.title}
                                                                    </h4>
                                                                    <Badge variant={priorityConfig.variant} className="text-xs">
                                                                        {priorityConfig.label}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {recommendation.description}
                                                                </p>
                                                                {recommendation.recipe_name && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Produk: {recommendation.recipe_name}
                                                                    </p>
                                                                )}
                                                                {recommendation.potential_savings && recommendation.potential_savings > 0 && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <span className="text-muted-foreground">
                                                                            Potensi penghematan:
                                                                        </span>
                                                                        <span className="font-semibold text-green-600 dark:text-green-500">
                                                                            {formatCurrency(recommendation.potential_savings)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="px-4 pb-4 pt-2 border-t bg-accent/20">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Langkah-langkah yang Disarankan:
                                                            </h5>
                                                            <ul className="space-y-2">
                                                                {recommendation.action_items.map((item, itemIndex) => (
                                                                    <li
                                                                        key={itemIndex}
                                                                        className="flex items-start gap-2 text-sm"
                                                                    >
                                                                        <span className="text-muted-foreground mt-0.5">
                                                                            {itemIndex + 1}.
                                                                        </span>
                                                                        <span className="flex-1">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="flex items-center gap-2 pt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {typeConfig.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
