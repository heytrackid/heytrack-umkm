'use client'

import { BarChart3, Calendar, CheckCircle, Clock, Download, Factory, Filter, Play, Plus, Search, XCircle } from '@/components/icons'
import { useProductionBatches, useUpdateProductionBatch } from '@/hooks/useProductionBatches'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { BreadcrumbPatterns, PageBreadcrumb, StatCardPatterns, StatsCards } from '@/components/ui/index'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'


import { ProductionFormDialog } from './ProductionFormDialog'

import type { ProductionStatus, Row } from '@/types/database'

// Extended type for production page display - matches API response
interface ProductionWithRecipe extends Omit<Row<'productions'>, 'completed_at' | 'notes' | 'quantity' | 'started_at'> {
    recipe?: Pick<Row<'recipes'>, 'name' | 'cook_time'> | null
    // Mapped fields from API
    batch_number: string
    planned_date: string
    actual_cost: number
    unit: string
    priority: number
    estimated_duration: number
    recipe_name?: string
    // Additional fields used in component
    quantity?: number
    started_at?: string | null
    completed_at?: string | null
    notes?: string | null
    // Override status to use the enum type
    status: ProductionStatus
}

const isProductionWithRecipe = (value: unknown): value is ProductionWithRecipe => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const record = value as Record<string, unknown>
    return typeof record['id'] === 'string' &&
           typeof record['batch_number'] === 'string' &&
           typeof record['status'] === 'string'
}

const isProductionWithRecipeArray = (value: unknown): value is ProductionWithRecipe[] =>
    Array.isArray(value) && value.every(isProductionWithRecipe)

const STATUS_CONFIG = {
    PLANNED: {
        label: 'Direncanakan',
        color: 'bg-secondary text-secondary-foreground dark:bg-gray-900/20 dark:text-gray-300',
        icon: Calendar
    },
    IN_PROGRESS: {
        label: 'Sedang Produksi',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        icon: Clock
    },
    COMPLETED: {
        label: 'Selesai',
        color: 'bg-secondary text-secondary-foreground dark:bg-gray-900/20 dark:text-gray-300',
        icon: CheckCircle
    },
    CANCELLED: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        icon: XCircle
    }
}

const EnhancedProductionPage = () => {
    const { formatCurrency } = useCurrency()
    const { isMobile } = useResponsive()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)

    // Fetch productions with standardized hook
    const { data, isLoading: loading } = useProductionBatches()
    
    // Type-safe productions array with proper assertion
    const productions: ProductionWithRecipe[] = (data && isProductionWithRecipeArray(data)) ? data : []

    const filteredProductions = productions.filter(prod => {
        // Safe search with null checks
        const batchNumber = prod.batch_number || ''
        const recipeName = prod.recipe?.name ?? ''

        const matchesSearch =
            batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipeName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || prod['status'] === statusFilter

        return matchesSearch && matchesStatus
    })

    // Calculate stats
    const stats = {
        total: productions.length,
        planned: productions.filter(p => p['status'] === 'PLANNED').length,
        inProgress: productions.filter(p => p['status'] === 'IN_PROGRESS').length,
        completed: productions.filter(p => p['status'] === 'COMPLETED').length,
        cancelled: productions.filter(p => p['status'] === 'CANCELLED').length,
        totalCost: productions
            .filter(p => p.actual_cost)
            .reduce((sum, p) => sum + (p.actual_cost ?? 0), 0),
        totalQuantity: productions
            .filter(p => p['status'] === 'COMPLETED')
            .reduce((sum, p) => sum + (p.quantity || 0), 0)
    }

    const getStatusBadge = (status: ProductionStatus) => {
        const config = STATUS_CONFIG[status]
        const Icon = config.icon
        return (
            <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    const updateProductionBatchMutation = useUpdateProductionBatch()

    const handleStartProduction = async (id: string) => {
        await updateProductionBatchMutation.mutateAsync({
            id,
            data: {
                status: 'IN_PROGRESS',
                started_at: new Date().toISOString()
            }
        })
    }

    const handleCompleteProduction = async (id: string) => {
        await updateProductionBatchMutation.mutateAsync({
            id,
            data: {
                status: 'COMPLETED',
                completed_at: new Date().toISOString()
            }
        })
    }

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                {/* Header - Always visible with disabled buttons */}
                <PageHeader
                    title="Production Tracking"
                    description="Kelola dan monitor produksi batch"
                    icon={<Factory className="h-7 w-7 sm:h-8 sm:w-8" />}
                    action={
                        <div className="flex gap-2">
                            <Button disabled className="flex-1 sm:flex-none">
                                <Plus className="h-4 w-4 mr-2" />
                                Produksi Baru
                            </Button>
                        </div>
                    }
                />

                {/* Stats Cards - Match actual layout: 5 cards */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-5'}`}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Card key={`skeleton-${i}`}>
                            <CardContent className="p-6">
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-muted dark:bg-muted/50 rounded w-2/3" />
                                    <div className="h-8 bg-muted dark:bg-muted/50 rounded w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters Skeleton */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="animate-pulse space-y-4">
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px] h-10 bg-muted rounded" />
                                <div className="w-[180px] h-10 bg-muted rounded" />
                                <div className="w-[180px] h-10 bg-muted rounded" />
                                <div className="w-10 h-10 bg-muted rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Cards Skeleton */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {[1, 2, 3].map(i => (
                        <Card key={`card-skeleton-${i}`}>
                            <CardHeader className="pb-3">
                                <div className="animate-pulse space-y-2">
                                    <div className="h-5 bg-muted rounded w-1/2" />
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="animate-pulse space-y-2">
                                    <div className="h-4 bg-muted rounded" />
                                    <div className="h-4 bg-muted rounded w-2/3" />
                                    <div className="h-10 bg-muted rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <PageBreadcrumb items={BreadcrumbPatterns.production} />

            <PageHeader
                title="Production Tracking"
                description="Kelola dan monitor produksi batch"
                icon={<Factory className="h-7 w-7 sm:h-8 sm:w-8" />}
                actions={
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Produksi Baru
                    </Button>
                }
            />

            {/* Stats Cards */}
            <StatsCards 
                stats={StatCardPatterns.production({
                    total: stats.total,
                    planned: stats.planned,
                    inProgress: stats.inProgress,
                    completed: stats.completed,
                    totalCost: stats.totalCost,
                    formatCurrency
                })}
                gridClassName={isMobile ? 'grid gap-4 grid-cols-2' : 'grid gap-4 md:grid-cols-5'}
            />

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari batch number atau produk..."
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="PLANNED">Direncanakan</SelectItem>
                                    <SelectItem value="IN_PROGRESS">Sedang Produksi</SelectItem>
                                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                                    <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                                </SelectContent>
                             </Select>

                             <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Search Results Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                                Menampilkan <span className="font-semibold text-foreground">{filteredProductions.length}</span> dari {productions.length} batch
                            </div>
                             {(searchTerm || statusFilter !== 'all') && (
                                 <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => {
                                         setSearchTerm('')
                                         setStatusFilter('all')
                                     }}
                                 >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Production List */}
            <SwipeableTabs defaultValue="active" className="space-y-4">
                <SwipeableTabsList>
                    <SwipeableTabsTrigger value="active">
                        Aktif ({stats.planned + stats.inProgress})
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="completed">
                        Selesai ({stats.completed})
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="all">
                        Semua ({stats.total})
                    </SwipeableTabsTrigger>
                </SwipeableTabsList>

                <SwipeableTabsContent value="active" className="space-y-4">
                    {filteredProductions.filter(p => p['status'] === 'PLANNED' || p['status'] === 'IN_PROGRESS').length === 0 ? (
                        <EmptyState
                            {...EmptyStatePresets.production}
                            actions={[
                                {
                                    label: 'Buat Batch Produksi',
                                    onClick: () => setIsFormOpen(true),
                                    icon: Plus
                                }
                            ]}
                            compact
                        />
                    ) : (
                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {filteredProductions
                                .filter(p => p['status'] === 'PLANNED' || p['status'] === 'IN_PROGRESS')
                                .map((production) => (
                                    <ProductionCard
                                        key={production['id']}
                                        production={production}
                                        onStart={handleStartProduction}
                                        onComplete={handleCompleteProduction}
                                        formatCurrency={formatCurrency}
                                        getStatusBadge={getStatusBadge}
                                    />
                                ))}
                        </div>
                    )}
                </SwipeableTabsContent>

                <SwipeableTabsContent value="completed" className="space-y-4">
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {filteredProductions
                            .filter(p => p['status'] === 'COMPLETED')
                            .map((production) => (
                                <ProductionCard
                                    key={production['id']}
                                    production={production}
                                    onStart={handleStartProduction}
                                    onComplete={handleCompleteProduction}
                                    formatCurrency={formatCurrency}
                                    getStatusBadge={getStatusBadge}
                                />
                            ))}
                    </div>
                </SwipeableTabsContent>

                <SwipeableTabsContent value="all" className="space-y-4">
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {filteredProductions.map((production) => (
                            <ProductionCard
                                key={production['id']}
                                production={production}
                                onStart={handleStartProduction}
                                onComplete={handleCompleteProduction}
                                formatCurrency={formatCurrency}
                                getStatusBadge={getStatusBadge}
                            />
                        ))}
                    </div>
                </SwipeableTabsContent>
            </SwipeableTabs>

            {/* Summary Card */}
            {stats.completed > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Production Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Completed</p>
                                <p className="text-2xl font-bold">{stats.completed} batch</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Quantity</p>
                                <p className="text-2xl font-bold">{stats.totalQuantity} units</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Cost/Batch</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(stats.completed > 0 ? stats.totalCost / stats.completed : 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            <ProductionFormDialog
                open={isFormOpen}
                onOpenChange={(open) => setIsFormOpen(open)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['production-batches'] })}
            />
        </div>
    )
}

// Production Card Component
interface ProductionCardProps {
    production: ProductionWithRecipe
    onStart: (id: string) => void
    onComplete: (id: string) => void
    formatCurrency: (amount: number) => string
    getStatusBadge: (status: ProductionStatus) => JSX.Element
}

const ProductionCard = ({
    production,
    onStart,
    onComplete,
    formatCurrency,
    getStatusBadge
}: ProductionCardProps) => (
    <Card className="hover: ">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{production.batch_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {production.recipe?.name ?? 'Unknown Recipe'}
                    </p>
                </div>
                {getStatusBadge(production['status'])}
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{production.quantity} {production.unit}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Planned Date</p>
                    <p className="font-medium">
                        {format(new Date(production.planned_date), 'dd MMM yyyy', { locale: idLocale })}
                    </p>
                </div>
            </div>

            {production.started_at && (
                <div className="text-sm">
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">
                        {format(new Date(production.started_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </p>
                </div>
            )}

            {production.completed_at && (
                <div className="text-sm">
                    <p className="text-muted-foreground">Completed</p>
                    <p className="font-medium">
                        {format(new Date(production.completed_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </p>
                </div>
            )}

            {production.actual_cost && (
                <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">Actual Cost</p>
                    <p className="text-lg font-bold text-muted-foreground">
                        {formatCurrency(production.actual_cost)}
                    </p>
                </div>
            )}

            {production.notes && (
                <div className="pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {production.notes}
                    </p>
                </div>
            )}

            <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                    Detail
                </Button>
                {production['status'] === 'PLANNED' && (
                    <Button size="sm" className="flex-1" onClick={() => onStart(production['id'])}>
                        <Play className="h-4 w-4 mr-1" />
                        Mulai
                    </Button>
                )}
                {production['status'] === 'IN_PROGRESS' && (
                    <Button size="sm" className="flex-1" onClick={() => onComplete(production['id'])}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selesai
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
)

export { EnhancedProductionPage }
