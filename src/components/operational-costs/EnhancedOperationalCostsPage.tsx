'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/settings-context'
import { useToast } from '@/hooks/use-toast'
import { useResponsive } from '@/hooks/useResponsive'
import { useSupabaseCRUD } from '@/hooks/supabase'
// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    Receipt,
    X,
} from 'lucide-react'

// Feature Components
import { EnhancedEmptyState } from './EnhancedEmptyState'
import { MobileOperationalCostCard } from './MobileOperationalCostCard'
import { OperationalCostStats } from './OperationalCostStats'
import { DeleteModal } from '@/components/ui'

// Types
import type { Database } from '@/types/supabase-generated'

type OperationalCost = Database['public']['Tables']['operational_costs']['Row']
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
    const router = useRouter()
    const { formatCurrency } = useSettings()

    // Use entity hook for fetching data
    const { data: costs, loading, refetch } = useSupabaseCRUD('operational_costs', {
        orderBy: { column: 'created_at', ascending: false },
    })

    // Use CRUD hook for operations
    const { delete: deleteCost } = useSupabaseCRUD('operational_costs')
    const { toast } = useToast()
    const { isMobile } = useResponsive()

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCost, setSelectedCost] = useState<OperationalCost | null>(null)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!costs) return []

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
                const dateA = new Date(a.created_at || 0).getTime()
                const dateB = new Date(b.created_at || 0).getTime()
                return dateB - dateA
            })
    }, [costs, searchTerm, categoryFilter])

    // Handlers
    const handleEdit = (cost: OperationalCost) => {
        router.push(`/operational-costs/${cost.id}/edit`)
    }

    const handleDelete = (cost: OperationalCost) => {
        setSelectedCost(cost)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedCost) return

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
        const confirmed = window.confirm(
            'Tambahkan template biaya operasional umum?\n\nIni akan menambahkan 8 kategori biaya yang umum digunakan.'
        )
        if (!confirmed) return

        try {
            const response = await fetch('/api/operational-costs/quick-setup', {
                method: 'POST',
            })

            if (!response.ok) throw new Error('Failed to setup')

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
    const getCategoryInfo = (categoryId: string) => {
        return COST_CATEGORIES.find((c) => c.id === categoryId) || COST_CATEGORIES[7]
    }

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

    // Empty state
    if (!loading && (!costs || costs.length === 0)) {
        return <EnhancedEmptyState onAdd={() => router.push('/operational-costs/new')} onQuickSetup={handleQuickSetup} />
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Receipt className="h-8 w-8" />
                        Biaya Operasional
                    </h1>
                    <p className="text-muted-foreground mt-1">Kelola semua biaya operasional bisnis Anda</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => router.push('/operational-costs/new')} className="flex-1 sm:flex-none">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Biaya
                    </Button>
                    <Button variant="outline" onClick={handleQuickSetup} className="flex-1 sm:flex-none">
                        <Zap className="h-4 w-4 mr-2" />
                        Setup Cepat
                    </Button>
                </div>
            </div>

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
                <Card>
                    <CardContent className="p-12 text-center">
                        <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Tidak ada biaya ditemukan</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {hasActiveFilters ? 'Coba ubah filter pencarian Anda' : 'Mulai dengan menambahkan biaya pertama'}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filter
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : isMobile ? (
                <div className="space-y-3">
                    {filteredData.map((cost: OperationalCost) => (
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
                    {filteredData.map((cost: OperationalCost) => {
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
                                                {getFrequencyLabel(cost.frequency || 'monthly')} • {formatCurrency(monthlyCost)}/bulan
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

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false)
                    setSelectedCost(null)
                }}
                onConfirm={handleConfirmDelete}
                title="Hapus Biaya Operasional"
                description={`Apakah Anda yakin ingin menghapus biaya "${selectedCost?.description}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    )
}
