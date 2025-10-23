'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatCurrentCurrency } from '@/lib/currency'
import { HPPAlert } from '@/types/hpp-tracking'
import {
    formatChangePercentage,
    formatTimeAgo,
    getAlertTypeLabel,
    getSeverityColors,
    getSeverityLabel
} from '@/utils/hpp-alert-helpers'
import { AlertCircle, AlertTriangle, ArrowRight, DollarSign, Info, TrendingDown, TrendingUp } from 'lucide-react'

interface HPPAlertDetailProps {
    alert: HPPAlert & { recipes?: { name: string } }
    open: boolean
    onOpenChange: (open: boolean) => void
    onDismiss: () => void
}

// Helper function to get severity config - using utility
const getSeverityConfig = (severity: HPPAlert['severity']) => {
    const colors = getSeverityColors(severity)
    const icon = severity === 'critical' ? AlertCircle : severity === 'high' ? AlertTriangle : Info
    const bgColor = severity === 'critical' || severity === 'high' ? 'bg-destructive/10' :
        severity === 'medium' ? 'bg-primary/10' : 'bg-secondary/10'

    return {
        color: colors.badgeVariant,
        icon,
        label: getSeverityLabel(severity),
        bgColor
    }
}

// Helper function to get alert type config - using utility
const getAlertTypeConfig = (alertType: HPPAlert['alert_type']) => {
    const icon = alertType === 'hpp_increase' ? TrendingUp :
        alertType === 'hpp_decrease' ? TrendingDown :
            alertType === 'margin_low' ? DollarSign : AlertTriangle

    const descriptions = {
        hpp_increase: 'HPP produk mengalami kenaikan signifikan',
        hpp_decrease: 'HPP produk mengalami penurunan',
        margin_low: 'Margin profit di bawah target minimum',
        cost_spike: 'Terjadi lonjakan biaya pada komponen tertentu'
    }

    return {
        icon,
        label: getAlertTypeLabel(alertType),
        description: descriptions[alertType]
    }
}

export function HPPAlertDetail({ alert, open, onOpenChange, onDismiss }: HPPAlertDetailProps) {
    const severityConfig = getSeverityConfig(alert.severity)
    const typeConfig = getAlertTypeConfig(alert.alert_type)
    const SeverityIcon = severityConfig.icon
    const TypeIcon = typeConfig.icon

    const changePercentage = alert.change_percentage
    const isIncrease = changePercentage > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${severityConfig.bgColor}`}>
                            <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl">{alert.title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {typeConfig.description}
                            </DialogDescription>
                        </div>
                        <Badge variant={severityConfig.color}>
                            <SeverityIcon className="h-3 w-3 mr-1" />
                            {severityConfig.label}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Product Info */}
                    {alert.recipes?.name && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Produk: </span>
                                    <span className="font-medium">{alert.recipes.name}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Alert Message */}
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-sm">{alert.message}</p>
                        </CardContent>
                    </Card>

                    {/* Before/After Comparison */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Perbandingan Nilai</h4>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">Sebelum</div>
                                        <div className="text-2xl font-bold">
                                            {formatCurrentCurrency(alert.old_value)}
                                        </div>
                                    </div>
                                    <ArrowRight className={`h-6 w-6 ${isIncrease ? 'text-destructive' : 'text-green-600'}`} />
                                    <div className="flex-1 text-right">
                                        <div className="text-xs text-muted-foreground mb-1">Sesudah</div>
                                        <div className="text-2xl font-bold">
                                            {formatCurrentCurrency(alert.new_value)}
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Perubahan</span>
                                    <div className="text-right">
                                        <div className="text-lg font-semibold">
                                            {formatCurrentCurrency(Math.abs(alert.new_value - alert.old_value))}
                                        </div>
                                        <div className={`text-sm font-medium ${isIncrease ? 'text-destructive' : 'text-green-600'}`}>
                                            {formatChangePercentage(changePercentage)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Affected Components */}
                    {alert.affected_components && (
                        <div>
                            <h4 className="text-sm font-medium mb-3">Komponen yang Berubah</h4>
                            <div className="space-y-3">
                                {/* Ingredients */}
                                {alert.affected_components.ingredients && alert.affected_components.ingredients.length > 0 && (
                                    <Card>
                                        <CardContent className="pt-4">
                                            <h5 className="text-sm font-medium mb-3">Bahan Baku</h5>
                                            <div className="space-y-2">
                                                {alert.affected_components.ingredients.map((ingredient, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">{ingredient.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatCurrentCurrency(ingredient.old)} → {formatCurrentCurrency(ingredient.new)}
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={ingredient.change > 0 ? 'destructive' : 'secondary'}
                                                            className="ml-2"
                                                        >
                                                            {ingredient.change > 0 ? '+' : ''}{ingredient.change.toFixed(1)}%
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Operational Costs */}
                                {alert.affected_components.operational && alert.affected_components.operational.length > 0 && (
                                    <Card>
                                        <CardContent className="pt-4">
                                            <h5 className="text-sm font-medium mb-3">Biaya Operasional</h5>
                                            <div className="space-y-2">
                                                {alert.affected_components.operational.map((cost, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm capitalize">{cost.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatCurrentCurrency(cost.old)} → {formatCurrentCurrency(cost.new)}
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={cost.change > 0 ? 'destructive' : 'secondary'}
                                                            className="ml-2"
                                                        >
                                                            {cost.change > 0 ? '+' : ''}{cost.change.toFixed(1)}%
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground text-center">
                        Alert dibuat {formatTimeAgo(alert.created_at)}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    <Button variant="destructive" onClick={onDismiss}>
                        Hapus Alert
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
