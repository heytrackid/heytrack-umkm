'use client'

import { AlertCircle, AlertTriangle, Info, ShoppingCart } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRestockSuggestions } from '@/hooks/useRestockSuggestions'






export const RestockSuggestionsPanel = (): JSX.Element => {
    const { data, isLoading, error } = useRestockSuggestions()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Restock Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Restock Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">Failed to load restock suggestions</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { data: suggestions, summary } = data ?? { data: [], summary: {} }

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency) {
            case 'CRITICAL':
                return <AlertCircle className="h-4 w-4 text-destructive" />
            case 'HIGH':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />
            case 'MEDIUM':
                return <Info className="h-4 w-4 text-yellow-500" />
            default:
                return <Info className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getUrgencyVariant = (urgency: string): "default" | "destructive" | "outline" | "secondary" => {
        switch (urgency) {
            case 'CRITICAL':
                return 'destructive'
            case 'HIGH':
                return 'default'
            case 'MEDIUM':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Restock Suggestions</CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="destructive">{summary.critical ?? 0} Critical</Badge>
                        <Badge variant="default">{summary.high ?? 0} High</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {suggestions.length > 0 ? (
                    <div className="space-y-4">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.ingredient_id}
                                className="flex items-start gap-4 rounded-lg border p-4"
                            >
                                <div className="mt-1">
                                    {getUrgencyIcon(suggestion.urgency)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{suggestion['ingredient_name']}</p>
                                            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                                        </div>
                                        <Badge variant={getUrgencyVariant(suggestion.urgency)}>
                                            {suggestion.urgency}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Available</p>
                                            <p className="font-medium">
                                                {suggestion.available_stock} {suggestion['ingredient_name'].split(' ')[0]}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Reserved</p>
                                            <p className="font-medium">{suggestion.reserved_stock}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Reorder Point</p>
                                            <p className="font-medium">{suggestion.reorder_point}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Suggested Order: {suggestion.suggested_order_quantity} units
                                            </p>
                                            {suggestion.lead_time_days && (
                                                <p className="text-xs text-muted-foreground">
                                                    Lead time: {suggestion.lead_time_days} days
                                                </p>
                                            )}
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Order Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">All ingredients are well stocked! 🎉</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


