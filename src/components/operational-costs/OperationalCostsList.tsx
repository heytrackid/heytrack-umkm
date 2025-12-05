'use client'

import { Plus, Receipt, Zap } from '@/components/icons'
import { postApi } from '@/lib/query/query-helpers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { SharedDataTable, type Column } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { DeleteModal } from '@/components/ui/index'
import { useSettings } from '@/contexts/settings-context'
import { successToast } from '@/hooks/use-toast'
import { useDeleteOperationalCost, useOperationalCosts } from '@/hooks/useOperationalCosts'
import { handleError } from '@/lib/error-handling'

import { OperationalCostFormDialog } from '@/components/operational-costs/OperationalCostFormDialog'
import { OperationalCostStats } from '@/components/operational-costs/OperationalCostStats'

import type { Row } from '@/types/database'

type OperationalCost = Row<'operational_costs'>

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
const DEFAULT_CATEGORY: CostCategory = COST_CATEGORIES[COST_CATEGORIES.length - 1] ?? { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' }

export const OperationalCostsList = (): JSX.Element => {
  const { formatCurrency } = useSettings()
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialog } = useConfirm()

  const { data: costsData, isLoading, refetch } = useOperationalCosts()
  const costs = useMemo(() => costsData || [], [costsData])
  const deleteCostMutation = useDeleteOperationalCost()

  const quickSetupMutation = useMutation({
    mutationFn: () => postApi<{ count: number }>('/operational-costs/quick-setup', {}),
    onSuccess: (data) => {
      successToast("Berhasil", `${data.count ?? COST_CATEGORIES.length} template biaya operasional berhasil ditambahkan`)
      void queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
    },
    onError: (error) => handleError(error, 'Add operational cost template', true, 'Gagal menambahkan template'),
  })

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCost, setSelectedCost] = useState<OperationalCost | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingCost, setEditingCost] = useState<OperationalCost | undefined>(undefined)

  // Helper functions
  const getCategoryInfo = (categoryId: string): CostCategory =>
    COST_CATEGORIES.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORY

  const calculateMonthlyCost = (cost: OperationalCost): number => {
    const amount = cost.amount ?? 0
    switch (cost.frequency) {
      case 'daily': return amount * 30
      case 'weekly': return amount * 4.33
      case 'monthly': return amount
      case 'yearly': return amount / 12
      default: return amount
    }
  }

  const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan' }
    return labels[frequency] ?? frequency
  }

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
    if (!selectedCost) return
    try {
      await deleteCostMutation.mutateAsync(selectedCost.id)
      setIsDeleteDialogOpen(false)
      setSelectedCost(null)
    } catch {
      // Error handled in mutation
    }
  }, [selectedCost, deleteCostMutation])

  const handleQuickSetup = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Tambahkan Template Biaya Operasional?',
      description: 'Ini akan menambahkan 8 kategori biaya yang umum digunakan.',
      confirmText: 'Tambahkan',
      variant: 'default'
    })
    if (confirmed) quickSetupMutation.mutate()
  }, [confirm, quickSetupMutation])

  // Column definitions
  const columns: Array<Column<OperationalCost>> = useMemo(() => [
    {
      key: 'description',
      header: 'Deskripsi',
      render: (_, cost) => {
        const category = getCategoryInfo(cost.category || 'other')
        return (
          <div className="flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <div>
              <span className="font-semibold">{cost.description}</span>
              <p className="text-xs text-muted-foreground">{category.name}</p>
            </div>
          </div>
        )
      }
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (_, cost) => (
        <div>
          <p className="font-bold text-primary">{formatCurrency(cost.amount || 0)}</p>
          <p className="text-xs text-muted-foreground">
            {getFrequencyLabel(cost.frequency ?? 'monthly')} • {formatCurrency(calculateMonthlyCost(cost))}/bulan
          </p>
        </div>
      )
    },
    {
      key: 'recurring',
      header: 'Tipe',
      render: (_, cost) => (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border/20">
          {cost.recurring ? 'Tetap' : 'Variabel'}
        </Badge>
      )
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (_, cost) => (
        <span className="text-sm text-muted-foreground italic line-clamp-1">
          {cost.notes || '-'}
        </span>
      )
    }
  ], [formatCurrency])



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-foreground font-medium">Biaya Operasional</span>
      </div>

      <PageHeader
        title="Biaya Operasional"
        description="Kelola semua biaya operasional bisnis Anda"
        action={<Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Tambah Biaya</Button>}
      />

      <OperationalCostStats costs={costs} formatCurrency={formatCurrency} calculateMonthlyCost={calculateMonthlyCost} />

      <Card className="bg-muted/20 border-border/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-secondary/50 p-2 rounded-lg flex-shrink-0">
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">💡 Mengapa Biaya Operasional Penting?</h3>
              <p className="text-sm text-foreground dark:text-gray-200">
                Biaya operasional digunakan untuk menghitung HPP dan harga jual yang akurat. Semakin lengkap data biaya, semakin tepat perhitungan harga jual produk Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SharedDataTable
        data={costs}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => void refetch()}
        onAdd={handleAdd}
        addButtonText="Tambah Biaya"
        searchPlaceholder="Cari biaya operasional..."
        emptyMessage="Belum Ada Biaya Operasional"
        emptyDescription="Tambahkan biaya operasional untuk perhitungan HPP yang lebih akurat."
        pageSizeOptions={[12, 24, 50, 100]}
        headerActions={
          <Button variant="outline" size="sm" onClick={handleQuickSetup}>
            <Zap className="h-4 w-4 mr-2" />Setup Cepat
          </Button>
        }
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedCost(null) }}
        onConfirm={handleConfirmDelete}
        entityName="Biaya Operasional"
        itemName={selectedCost?.description ?? ''}
      />

      <OperationalCostFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        {...(editingCost && { cost: editingCost })}
        onSuccess={() => void refetch()}
      />

      <ConfirmDialog />
    </div>
  )
}
