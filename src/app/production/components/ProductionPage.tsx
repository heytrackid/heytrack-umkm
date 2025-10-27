'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Factory,
    Plus,
    Search,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Package
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

type ProductionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

interface Production {
    id: string
    recipe_id: string
    batch_number: string
    quantity: number
    unit: string
    status: ProductionStatus
    planned_date: string
    started_at: string | null
    completed_at: string | null
    actual_cost: number | null
    notes: string | null
    created_at: string
    recipe?: {
        name: string
    }
}

const STATUS_CONFIG = {
    PLANNED: {
        label: 'Direncanakan',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        icon: Calendar
    },
    IN_PROGRESS: {
        label: 'Sedang Produksi',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        icon: Clock
    },
    COMPLETED: {
        label: 'Selesai',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        icon: CheckCircle
    },
    CANCELLED: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        icon: XCircle
    }
}

export function ProductionPage() {
    const { formatCurrency } = useCurrency()
    const [productions, setProductions] = useState<Production[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    useEffect(() => {
        fetchProductions()
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
            console.error('Error fetching productions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProductions = productions.filter(prod => {
        const matchesSearch =
            prod.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prod.recipe?.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || prod.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // Calculate stats
    const stats = {
        total: productions.length,
        planned: productions.filter(p => p.status === 'PLANNED').length,
        inProgress: productions.filter(p => p.status === 'IN_PROGRESS').length,
        completed: productions.filter(p => p.status === 'COMPLETED').length,
        totalCost: productions
            .filter(p => p.actual_cost)
            .reduce((sum, p) => sum + (p.actual_cost || 0), 0)
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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Factory className="h-8 w-8" />
                            Production Tracking
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola dan monitor produksi batch
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Factory className="h-8 w-8" />
                        Production Tracking
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola dan monitor produksi batch
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Produksi Baru
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
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
                            <Calendar className="h-8 w-8 text-blue-600" />
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
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
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
                            <SelectTrigger className="w-[180px]">
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
                    </div>

                    {/* Search Results Info */}
                    <div className="flex items-center justify-between text-sm mt-4">
                        <div className="text-muted-foreground">
                            Menampilkan <span className="font-semibold text-foreground">{filteredProductions.length}</span> dari {productions.length} batch
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Production List */}
            {filteredProductions.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Factory className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Tidak Ada Batch yang Cocok'
                                    : 'Belum Ada Produksi'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Coba ubah filter atau kata kunci pencarian'
                                    : 'Klik tombol "Produksi Baru" untuk membuat batch produksi pertama'}
                            </p>
                            {!(searchTerm || statusFilter !== 'all') && (
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Batch Pertama
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProductions.map((production) => (
                        <Card key={production.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{production.batch_number}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {production.recipe?.name || 'Unknown Recipe'}
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

                                {production.actual_cost && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-muted-foreground">Actual Cost</p>
                                        <p className="text-lg font-bold text-green-600">
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
                                        <Button size="sm" className="flex-1">
                                            Mulai Produksi
                                        </Button>
                                    )}
                                    {production.status === 'IN_PROGRESS' && (
                                        <Button size="sm" className="flex-1">
                                            Selesaikan
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Summary Card */}
            {stats.completed > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Production Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Completed</p>
                                <p className="text-2xl font-bold">{stats.completed} batch</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Production Cost</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Cost per Batch</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(stats.completed > 0 ? stats.totalCost / stats.completed : 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
