'use client'

import {
    Edit,
    MoreVertical,
    Plus,
    Receipt,
    Search,
    Trash2,
    X,
    Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useCallback } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { GridSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loader'
import { DeleteModal } from '@/components/ui/index'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { useSettings } from '@/contexts/settings-context'
import { toast } from 'sonner'
import { useOperationalCosts, useDeleteOperationalCost } from '@/hooks/useOperationalCosts'
import { usePagination } from '@/hooks/usePagination'
import { useResponsive } from '@/hooks/useResponsive'

import type { Row } from '@/types/database'

import { MobileOperationalCostCard } from '@/components/operational-costs/MobileOperationalCostCard'
import { OperationalCostFormDialog } from '@/components/operational-costs/OperationalCostFormDialog'
import { OperationalCostStats } from '@/components/operational-costs/OperationalCostStats'

import type { DateRange } from 'react-day-picker'

type OperationalCost = Row<'operational_costs'>
type CategoryFilter =
    | 'all'
    | 'communication'
    | 'insurance'
    | 'maintenance'
    | 'other'
    | 'rent'
    | 'staff'
    | 'transport'
    | 'utilities'

interface QuickSetupErrorPayload {
    error?: string
}

interface QuickSetupResultPayload {
    count?: number
}

const isQuickSetupErrorPayload = (value: unknown): value is QuickSetupErrorPayload => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const { error } = value as { error?: unknown }
    return error === undefined || typeof error === 'string'
}

const isQuickSetupResultPayload = (value: unknown): value is QuickSetupResultPayload => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const { count } = value as { count?: unknown }
    return count === undefined || typeof count === 'number'
}

// Constants
interface CostCategory { id: string; name: string; icon: string; description: string }
const COST_CATEGORIES: CostCategory[] = [
    { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
    { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
    { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
    { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
    { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
    { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
    { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
    { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' },
]
const DEFAULT_CATEGORY: CostCategory =
    COST_CATEGORIES[COST_CATEGORIES.length - 1] ??
    { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' }

export const OperationalCostsList = () => {
    const _router = useRouter()
    const { formatCurrency } = useSettings()

    // Use query hook for fetching data
    const { data: costs, isLoading: loading, refetch } = useOperationalCosts()

    // Use delete mutation
    const deleteCostMutation = useDeleteOperationalCost()

    const { isMobile } = useResponsive()
    const { confirm, ConfirmDialog } = useConfirm()

    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCost, setSelectedCost] = useState<OperationalCost | null>(null)
    const [showFormDialog, setShowFormDialog] = useState(false)
    const [editingCost, setEditingCost] = useState<OperationalCost | undefined>(undefined)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [pageSize, setPageSize] = useState(12)

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!costs) { return [] }

        return costs
            .filter((cost: OperationalCost) => {
                // Search filter
                const matchesSearch =
                    !searchTerm ||
                    cost.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cost.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (cost.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

                // Category filter
                const matchesCategory = categoryFilter === 'all' || cost.category === categoryFilter

                // Date filter
                let matchesDate = true
                if (dateRange?.from && cost.created_at) {
                    const costDate = new Date(cost.created_at)
                    const fromDate = new Date(dateRange.from)
                    fromDate.setHours(0, 0, 0, 0)
                    
                    if (dateRange.to) {
                        const toDate = new Date(dateRange.to)
                        toDate.setHours(23, 59, 59, 999)
                        matchesDate = costDate >= fromDate && costDate <= toDate
                    } else {
                        matchesDate = costDate >= fromDate
                    }
                }

                return matchesSearch && matchesCategory && matchesDate
            })
            .sort((a: OperationalCost, b: OperationalCost) => {
                const dateA = new Date(a.created_at ?? 0).getTime()
                const dateB = new Date(b.created_at ?? 0).getTime()
                return dateB - dateA
            })
    }, [costs, searchTerm, categoryFilter, dateRange])

    // Pagination
    const pagination = usePagination({
        initialPageSize: pageSize,
        totalItems: filteredData.length,
    })

    // Get paginated data
    const paginatedData = useMemo(() => filteredData.slice(pagination.startIndex, pagination.endIndex), [filteredData, pagination.startIndex, pagination.endIndex])

    // Update page size
    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize)
        pagination.setPageSize(newSize)
    }, [pagination])

    // Handlers
    const handleEdit = useCallback((cost: OperationalCost) => {
        setEditingCost(cost)
        setShowFormDialog(true)
    }, [])

    const handleAdd = useCallback(() => {
        setEditingCost(undefined)
        setShowFormDialog(true)
    }, [])

    const handleDelete = useCallback((cost: OperationalCost) => {
        setSelectedCost(cost)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedCost) { return }

        try {
            await deleteCostMutation.mutateAsync(selectedCost['id'])
            setIsDeleteDialogOpen(false)
            setSelectedCost(null)
        } catch {
            // Error handling is done in the mutation hook
        }
    }, [selectedCost, deleteCostMutation])

    const handleQuickSetup = useCallback(async () => {
        try {
            const confirmed = await confirm({
                title: 'Tambahkan Template Biaya Operasional?',
                description: 'Ini akan menambahkan 8 kategori biaya yang umum digunakan.',
                confirmText: 'Tambahkan',
                variant: 'default'
            })

            if (!confirmed) { return }

            const response = await fetch('/api/operational-costs/quick-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorPayload: unknown = await response.json()
                const errorMessage = isQuickSetupErrorPayload(errorPayload) ? errorPayload.error : undefined
                throw new Error(errorMessage ?? 'Failed to setup')
            }

            const resultPayload: unknown = await response.json()
            const templatesAdded = isQuickSetupResultPayload(resultPayload)
                ? resultPayload.count ?? COST_CATEGORIES.length
                : COST_CATEGORIES.length

            toast.success(`${templatesAdded} template biaya operasional berhasil ditambahkan`)

            // Force refresh page to show new data
            _router.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menambahkan template'
            toast.error(message)
        }
    }, [confirm, _router])

    const clearFilters = () => {
        setSearchTerm('')
        setCategoryFilter('all')
        setDateRange(undefined)
    }

    const hasActiveFilters = Boolean(searchTerm || categoryFilter !== 'all' || dateRange !== undefined)

    // Helper functions
    const getCategoryInfo = (categoryId: string): CostCategory =>
        COST_CATEGORIES.find((category) => category.id === categoryId) ?? DEFAULT_CATEGORY

    const calculateMonthlyCost = (cost: OperationalCost) => {
        const amount = cost.amount ?? 0
        switch (cost.frequency) {
            case 'daily':
                return amount * 30
            case 'weekly':
                return amount * 4.33
            case 'monthly':
                return amount
            case 'yearly':
                return amount / 12
            case null:
                return amount
            default:
                return amount
        }
    }

    const getFrequencyLabel = (frequency: string) => {
        const labels: Record<string, string> = {
            daily: 'Harian',
            weekly: 'Mingguan',
            monthly: 'Bulanan',
            yearly: 'Tahunan',
        }
        return labels[frequency] ?? frequency
    }

    // Prevent hydration mismatch - wait for client mount
    if (!isMounted) {
        return (
            <div className="space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="text-foreground font-medium">Biaya Operasional</span>
                </div>
                {/* Loading skeleton */}
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-40 bg-muted rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium">Biaya Operasional</span>
            </div>

            {/* Header */}
            <PageHeader
                title="Biaya Operasional"
                description="Kelola semua biaya operasional bisnis Anda"
                action={
                    <Button onClick={handleAdd} hapticFeedback>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Biaya
                    </Button>
                }
            />

            {/* Stats Cards */}
            <OperationalCostStats costs={costs || []} formatCurrency={formatCurrency} calculateMonthlyCost={calculateMonthlyCost} />

            {/* Info Card */}
            <Card className="bg-muted/20 border-border/20 ">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-secondary/50 p-2 rounded-lg flex-shrink-0">
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                                💡 Mengapa Biaya Operasional Penting?
                            </h3>
                            <p className="text-sm text-foreground dark:text-gray-200">
                                Biaya operasional digunakan untuk menghitung HPP dan harga jual yang akurat. Semakin lengkap data
                                biaya, semakin tepat perhitungan harga jual produk Anda.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari biaya operasional..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
                            >
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {COST_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>



                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Preset Button */}
                        <div className="flex justify-start">
                            <Button variant="outline" onClick={handleQuickSetup}>
                                <Zap className="h-4 w-4 mr-2" />
                                Setup Cepat
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Menampilkan {filteredData.length} dari {costs?.length || 0} biaya
                </p>
            </div>

            {/* Cost List */}
            {loading && (
                <GridSkeleton columns={3} items={6} />
            )}
            
            {!loading && filteredData.length === 0 && (!costs || costs.length === 0) && (
                <EmptyState
                    {...EmptyStatePresets.operationalCosts}
                    actions={[
                        {
                            label: 'Setup Cepat (8 Template)',
                            onClick: handleQuickSetup,
                            icon: Zap
                        },
                        {
                            label: 'Tambah Manual',
                            onClick: handleAdd,
                            variant: 'outline',
                            icon: Plus
                        }
                    ]}
                />
            )}
            
            {!loading && filteredData.length === 0 && costs && costs.length > 0 && (
                /* Empty state - filtered results */
                <Card className="border-dashed">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="rounded-full bg-muted flex items-center justify-center mb-4 w-16 h-16 mx-auto">
                                <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2 text-lg">
                                Tidak Ada Hasil
                            </h3>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Coba gunakan kata kunci yang berbeda atau filter lain.
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Hapus Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {!loading && filteredData.length > 0 && isMobile && (
                <div className="space-y-3">
                    {paginatedData.map((cost: OperationalCost) => (
                        <MobileOperationalCostCard
                            key={cost['id']}
                            cost={cost}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            getCategoryInfo={getCategoryInfo}
                            formatCurrency={formatCurrency}
                            calculateMonthlyCost={calculateMonthlyCost}
                            getFrequencyLabel={getFrequencyLabel}
                        />
                    ))}
                </div>
            )}
            
            {!loading && filteredData.length > 0 && !isMobile && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedData.map((cost: OperationalCost) => {
                        const category = getCategoryInfo(cost.category || 'other')
                        const monthlyCost = calculateMonthlyCost(cost)

                        return (
                            <Card key={cost['id']} className="transition-all">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-2xl">{category.icon}</span>
                                                    <h3 className="font-semibold text-lg">{cost.description}</h3>
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
                                                    <DropdownMenuItem onClick={() => handleEdit(cost)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(cost)} className="text-muted-foreground">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Amount */}
                                        <div>
                                            <p className="text-2xl font-bold text-primary">{formatCurrency(cost.amount || 0)}</p>
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
                                        {cost.notes && (
                                            <p className="text-sm text-muted-foreground italic line-clamp-2">{cost.notes}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {filteredData.length > 0 && (
                <SimplePagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    totalPages={pagination.totalPages}
                    totalItems={filteredData.length}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={handlePageSizeChange}
                    canNextPage={pagination.canNextPage}
                    canPrevPage={pagination.canPrevPage}
                    pageSizeOptions={[12, 24, 48, 96]}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false)
                    setSelectedCost(null)
                }}
                onConfirm={handleConfirmDelete}
                entityName="Biaya Operasional"
                itemName={selectedCost?.description ?? ''}
            />

            {/* Form Dialog */}
            <OperationalCostFormDialog
                open={showFormDialog}
                onOpenChange={setShowFormDialog}
                {...(editingCost && { cost: editingCost })}
                onSuccess={() => refetch?.()}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog />
        </div>
    )
}


