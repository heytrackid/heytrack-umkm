'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/settings-context'
import { useToast } from '@/hooks/use-toast'
import { useResponsive } from '@/hooks/useResponsive'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useSupabaseCRUD, useSupabaseQuery } from '@/hooks/supabase'
import { usePagination } from '@/hooks/usePagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { PageHeader } from '@/components/layout/PageHeader'
import { EnhancedEmptyState } from './EnhancedEmptyState'
import { MobileOperationalCostCard } from './MobileOperationalCostCard'
import { OperationalCostStats } from './OperationalCostStats'
import { DeleteModal } from '@/components/ui'
import { OperationalCostFormDialog } from './OperationalCostFormDialog'
import type { OperationalCostsTable } from '@/types/database'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    Plus,
    Zap,
    MoreVertical,
    Edit,
    Trash2,
    X,
    Receipt,
} from 'lucide-react'

// Feature Components

// Types

type OperationalCost = OperationalCostsTable
type CategoryFilter = 'all' | 'utilities' | 'rent' | 'staff' | 'transport' | 'communication' | 'insurance' | 'maintenance' | 'other'

// Constants
const COST_CATEGORIES = [
    { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
    { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
    { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
    { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
    { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
    { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
    { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
    { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' },
]

export const EnhancedOperationalCostsPage = () => {
    const _router = useRouter()
    const { formatCurrency } = useSettings()

    // Use query hook for fetching data
    const { data: costs, loading, refetch } = useSupabaseQuery('operational_costs', {
        orderBy: { column: 'created_at', ascending: false },
    })

    // Use CRUD hook for operations
    const { delete: deleteCost } = useSupabaseCRUD('operational_costs')
    const { toast } = useToast()
    const { isMobile } = useResponsive()
    const { confirm } = useConfirm()

    // Hydration fix - prevent SSR/client mismatch
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

                return matchesSearch && matchesCategory
            })
            .sort((a: OperationalCost, b: OperationalCost) => {
                const dateA = new Date(a.created_at ?? 0).getTime()
                const dateB = new Date(b.created_at ?? 0).getTime()
                return dateB - dateA
            })
    }, [costs, searchTerm, categoryFilter])

    // Pagination
    const pagination = usePagination({
        initialPageSize: pageSize,
        totalItems: filteredData.length,
    })

    // Get paginated data
    const paginatedData = useMemo(() => filteredData.slice(pagination.startIndex, pagination.endIndex), [filteredData, pagination.startIndex, pagination.endIndex])

    // Update page size
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize)
        pagination.setPageSize(newSize)
    }

    // Handlers
    const handleEdit = (cost: OperationalCost) => {
        setEditingCost(cost)
        setShowFormDialog(true)
    }

    const handleAdd = () => {
        setEditingCost(undefined)
        setShowFormDialog(true)
    }

    const handleDelete = (cost: OperationalCost) => {
        setSelectedCost(cost)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedCost) { return }

        try {
            await deleteCost(selectedCost.id)
            toast({
                title: 'Biaya dihapus',
                description: `${selectedCost.description} berhasil dihapus`,
            })
            setIsDeleteDialogOpen(false)
            setSelectedCost(null)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menghapus biaya'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
        }
    }

    const handleQuickSetup = async () => {
        const confirmed = await confirm({
            title: 'Tambahkan Template Biaya Operasional?',
            description: 'Ini akan menambahkan 8 kategori biaya yang umum digunakan.',
            confirmText: 'Tambahkan',
            variant: 'default'
        })
        if (!confirmed) { return }

        try {
            const response = await fetch('/api/operational-costs/quick-setup', {
                method: 'POST',
            })

            if (!response.ok) { throw new Error('Failed to setup') }

            toast({
                title: 'Template ditambahkan',
                description: 'Template biaya operasional berhasil ditambahkan',
            })

            // Refresh data
            refetch?.()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menambahkan template'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setCategoryFilter('all')
    }

    const hasActiveFilters = searchTerm || categoryFilter !== 'all'

    // Helper functions
    const getCategoryInfo = (categoryId: string) => COST_CATEGORIES.find((c) => c.id === categoryId) ?? COST_CATEGORIES[7]

    const calculateMonthlyCost = (cost: OperationalCost) => {
        const amount = cost.amount || 0
        switch (cost.frequency) {
            case 'daily':
                return amount * 30
            case 'weekly':
                return amount * 4.33
            case 'monthly':
                return amount
            case 'yearly':
                return amount / 12
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
        return labels[frequency] || frequency
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
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
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
                    <div className="flex gap-2">
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Biaya
                        </Button>
                        <Button variant="outline" onClick={handleQuickSetup}>
                            <Zap className="h-4 w-4 mr-2" />
                            Setup Cepat
                        </Button>
                    </div>
                }
            />

            {/* Stats Cards */}
            <OperationalCostStats costs={costs || []} formatCurrency={formatCurrency} calculateMonthlyCost={calculateMonthlyCost} />

            {/* Info Card */}
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-100 dark:bg-orange-800/50 p-2 rounded-lg flex-shrink-0">
                            <Receipt className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                                💡 Mengapa Biaya Operasional Penting?
                            </h3>
                            <p className="text-sm text-orange-800 dark:text-orange-200">
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
                                onChange={(e) => setSearchTerm(e.target.value)}
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
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredData.length === 0 ? (
                <>
                    {/* Empty state - no data at all */}
                    {!costs || costs.length === 0 ? (
                        <EnhancedEmptyState onAdd={handleAdd} onQuickSetup={handleQuickSetup} />
                    ) : (
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
                </>
            ) : isMobile ? (
                <div className="space-y-3">
                    {paginatedData.map((cost: OperationalCost) => (
                        <MobileOperationalCostCard
                            key={cost.id}
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
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedData.map((cost: OperationalCost) => {
                        const category = getCategoryInfo(cost.category || 'other')
                        const monthlyCost = calculateMonthlyCost(cost)

                        return (
                            <Card key={cost.id} className="hover:shadow-md transition-shadow">
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
                                                    <DropdownMenuItem onClick={() => handleDelete(cost)} className="text-red-600">
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
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    Tetap
                                                </Badge>
                                            )}
                                            {!cost.recurring && (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
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
                cost={editingCost}
                onSuccess={() => refetch?.()}
            />
        </div>
    )
}
