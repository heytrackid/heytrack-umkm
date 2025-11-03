'use client'

import { useState, useEffect } from 'react'
import type { ProductionStatus, ProductionBatchesTable, RecipesTable } from '@/types/database'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { apiLogger } from '@/lib/logger'
import { ProductionFormDialog } from './ProductionFormDialog'
import { Factory, Plus, Search, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Package, Play, BarChart3, Filter, Download, RefreshCw } from 'lucide-react'

// Extended type for production page display
interface ProductionWithRecipe extends ProductionBatchesTable {
    recipe?: Pick<RecipesTable, 'name'> | null
    // Override status to use the enum type
    status: ProductionStatus
}

const STATUS_CONFIG = {
    PLANNED: {
        label: 'Direncanakan',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        icon: Calendar
    },
    IN_PROGRESS: {
        label: 'Sedang Produksi',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        icon: Clock
    },
    COMPLETED: {
        label: 'Selesai',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        icon: CheckCircle
    },
    CANCELLED: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        icon: XCircle
    }
}

export const EnhancedProductionPage = () => {
    const { formatCurrency } = useCurrency()
    const { isMobile } = useResponsive()
    const [productions, setProductions] = useState<ProductionWithRecipe[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [dateFilter, setDateFilter] = useState<string>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)

    useEffect(() => {
        void fetchProductions()
    }, [])

    const fetchProductions = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/production-batches')
            if (response.ok) {
                const data = await response.json()
                setProductions(data)
            }
        } catch (error) {
            apiLogger.error({ error }, 'Error fetching productions')
        } finally {
            setLoading(false)
        }
    }

    const filteredProductions = productions.filter(prod => {
        // Safe search with null checks
        const batchNumber = prod.batch_number || ''
        const recipeName = prod.recipe?.name ?? ''

        const matchesSearch =
            batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipeName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || prod.status === statusFilter

        // Date filter
        let matchesDate = true
        if (dateFilter !== 'all') {
            const prodDate = new Date(prod.planned_date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            switch (dateFilter) {
                case 'today':
                    matchesDate = prodDate.toDateString() === today.toDateString()
                    break
                case 'week': {
                    const weekAgo = new Date(today)
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    matchesDate = prodDate >= weekAgo
                    break
                }
                case 'month': {
                    const monthAgo = new Date(today)
                    monthAgo.setMonth(monthAgo.getMonth() - 1)
                    matchesDate = prodDate >= monthAgo
                    break
                }
            }
        }

        return matchesSearch && matchesStatus && matchesDate
    })

    // Calculate stats
    const stats = {
        total: productions.length,
        planned: productions.filter(p => p.status === 'PLANNED').length,
        inProgress: productions.filter(p => p.status === 'IN_PROGRESS').length,
        completed: productions.filter(p => p.status === 'COMPLETED').length,
        cancelled: productions.filter(p => p.status === 'CANCELLED').length,
        totalCost: productions
            .filter(p => p.actual_cost)
            .reduce((sum, p) => sum + (p.actual_cost ?? 0), 0),
        totalQuantity: productions
            .filter(p => p.status === 'COMPLETED')
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

    const handleStartProduction = async (id: string) => {
        try {
            const response = await fetch(`/api/production-batches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'IN_PROGRESS',
                    started_at: new Date().toISOString()
                })
            })

            if (response.ok) {
                await fetchProductions()
            }
        } catch (error) {
            apiLogger.error({ error }, 'Error starting production')
        }
    }

    const handleCompleteProduction = async (id: string) => {
        try {
            const response = await fetch(`/api/production-batches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    completed_at: new Date().toISOString()
                })
            })

            if (response.ok) {
                await fetchProductions()
            }
        } catch (error) {
            apiLogger.error({ error }, 'Error completing production')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                {/* Header - Always visible with disabled buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <Factory className="h-7 w-7 sm:h-8 sm:w-8" />
                            Production Tracking
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola dan monitor produksi batch
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled className="flex-1 sm:flex-none">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button disabled className="flex-1 sm:flex-none">
                            <Plus className="h-4 w-4 mr-2" />
                            Produksi Baru
                        </Button>
                    </div>
                </div>

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
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <Factory className="h-7 w-7 sm:h-8 sm:w-8" />
                        Production Tracking
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola dan monitor produksi batch
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchProductions} className="flex-1 sm:flex-none">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsFormOpen(true)}
                        className="flex-1 sm:flex-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Produksi Baru
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-5'}`}>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Batch</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Direncanakan</p>
                                <p className="text-2xl font-bold">{stats.planned}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sedang Produksi</p>
                                <p className="text-2xl font-bold">{stats.inProgress}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Selesai</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                                <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                                        onChange={(e) => setSearchTerm(e.target.value)}
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

                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tanggal</SelectItem>
                                    <SelectItem value="today">Hari Ini</SelectItem>
                                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                                    <SelectItem value="month">30 Hari Terakhir</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Search Results Info */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                                Menampilkan <span className="font-semibold text-foreground">{filteredProductions.length}</span> dari {productions.length} batch
                            </div>
                            {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setStatusFilter('all')
                                        setDateFilter('all')
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
                    {filteredProductions.filter(p => p.status === 'PLANNED' || p.status === 'IN_PROGRESS').length === 0 ? (
                        <EmptyState
                            {...EmptyStatePresets.production}
                            actions={[
                                {
                                    label: 'Buat Batch Produksi',
                                    onClick: () => { },
                                    icon: Plus
                                }
                            ]}
                            compact
                        />
                    ) : (
                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                            {filteredProductions
                                .filter(p => p.status === 'PLANNED' || p.status === 'IN_PROGRESS')
                                .map((production) => (
                                    <ProductionCard
                                        key={production.id}
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
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                        {filteredProductions
                            .filter(p => p.status === 'COMPLETED')
                            .map((production) => (
                                <ProductionCard
                                    key={production.id}
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
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                        {filteredProductions.map((production) => (
                            <ProductionCard
                                key={production.id}
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
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Production Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                onOpenChange={setIsFormOpen}
                onSuccess={fetchProductions}
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
    <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{production.batch_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {production.recipe?.name ?? 'Unknown Recipe'}
                    </p>
                </div>
                {getStatusBadge(production.status)}
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
                    <p className="text-lg font-bold text-gray-600">
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
                {production.status === 'PLANNED' && (
                    <Button size="sm" className="flex-1" onClick={() => onStart(production.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Mulai
                    </Button>
                )}
                {production.status === 'IN_PROGRESS' && (
                    <Button size="sm" className="flex-1" onClick={() => onComplete(production.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selesai
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
)
