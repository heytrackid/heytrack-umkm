'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useCurrency } from '@/hooks/useCurrency'
import { getPriorityConfig, getTypeConfig } from './recommendationConfig'
import type { HPPRecommendation } from '@/types/hpp-tracking'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

interface RecommendationItemProps {
    recommendation: HPPRecommendation & { recipe_id: string; recipe_name: string }
    uniqueId: string
    isExpanded: boolean
    onToggle: () => void
}

export function RecommendationItem({
    recommendation,
    uniqueId,
    isExpanded,
    onToggle
}: RecommendationItemProps) {
    const { formatCurrency } = useCurrency()
    const priorityConfig = getPriorityConfig(recommendation.priority)
    const typeConfig = getTypeConfig(recommendation.type)

    // Map icon names to actual icon components
    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'users':
                return 'Users'
            case 'package':
                return 'Package'
            case 'trending-up':
                return 'TrendingUp'
            case 'dollar-sign':
                return 'DollarSign'
            default:
                return 'Lightbulb'
        }
    }

    const IconComponent = getIconComponent(typeConfig.icon)

    return (
        <Collapsible
            key={uniqueId}
            open={isExpanded}
            onOpenChange={onToggle}
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
                                    {/* We'll use a simple div with text for now since we can't import icons dynamically */}
                                    <div className={`h-5 w-5 ${typeConfig.color}`}>
                                        {IconComponent === 'Users' && '👥'}
                                        {IconComponent === 'Package' && '📦'}
                                        {IconComponent === 'TrendingUp' && '📈'}
                                        {IconComponent === 'DollarSign' && '💰'}
                                    </div>
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
}
