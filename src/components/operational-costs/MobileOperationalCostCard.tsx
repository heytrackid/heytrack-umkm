'use client'

import { MoreVertical, Edit, Trash2 } from 'lucide-react'

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

type OperationalCost = Row<'operational_costs'>

interface MobileOperationalCostCardProps {
    cost: OperationalCost
    onEdit: (cost: OperationalCost) => void
    onDelete: (cost: OperationalCost) => void
    getCategoryInfo: (categoryId: string) => { id: string; name: string; icon: string; description: string }
    formatCurrency: (amount: number) => string
    calculateMonthlyCost: (cost: OperationalCost) => number
    getFrequencyLabel: (frequency: string) => string
}

export const MobileOperationalCostCard = ({
    cost,
    onEdit,
    onDelete,
    getCategoryInfo,
    formatCurrency,
    calculateMonthlyCost,
    getFrequencyLabel,
}: MobileOperationalCostCardProps) => {
    const category = getCategoryInfo(cost.category || 'other')
    const monthlyCost = calculateMonthlyCost(cost)

    return (
        <Card className="transition-all">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{category.icon}</span>
                                <h3 className="font-semibold">{cost.description}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEdit(cost)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(cost)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Amount */}
                    <div>
                        <p className="text-xl font-bold text-primary">{formatCurrency(cost.amount || 0)}</p>
                        <p className="text-sm text-muted-foreground">
                            {getFrequencyLabel(cost.frequency ?? 'monthly')} • {formatCurrency(monthlyCost)}/bulan
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {cost.recurring && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/20">
                                Tetap
                            </Badge>
                        )}
                        {!cost.recurring && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/20">
                                Variabel
                            </Badge>
                        )}
                    </div>

                    {/* Notes */}
                    {cost.notes && <p className="text-sm text-muted-foreground italic line-clamp-2">{cost.notes}</p>}
                </div>
            </CardContent>
        </Card>
    )
}


