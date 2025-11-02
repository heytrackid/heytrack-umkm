'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { PageBreadcrumb, BreadcrumbPatterns, PageHeader, StatsCards, StatCardPatterns } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Plus, Upload, TrendingUp, Users, DollarSign, Package } from 'lucide-react'
import { SuppliersCRUD } from '@/components/crud/suppliers-crud'
import { useSupabaseCRUD } from '@/hooks/supabase/useSupabaseCRUD'
import type { SuppliersTable } from '@/types/database'

const SuppliersPage = () => {
    const { data: suppliers, loading } = useSupabaseCRUD('suppliers')
    const [showAddDialog, setShowAddDialog] = useState(false)

    // Calculate stats
    const totalSuppliers = suppliers?.length ?? 0
    const activeSuppliers = suppliers?.filter((s: SuppliersTable) => s.is_active).length ?? 0
    const totalSpent = suppliers?.reduce((sum: number, s: SuppliersTable) =>
        sum + (Number(s.total_spent) || 0), 0
    ) ?? 0
    const avgRating = suppliers && suppliers.length > 0
        ? suppliers.reduce((sum: number, s: SuppliersTable) =>
            sum + (Number(s.rating) || 0), 0
        ) / suppliers.length
        : 0

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <PageBreadcrumb items={BreadcrumbPatterns.suppliers} />

                {/* Header */}
                <PageHeader
                    title="Supplier"
                    description="Kelola data supplier dan vendor bahan baku"
                    actions={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {/* TODO: Import dialog */ }}
                                className="flex-1 sm:flex-none"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </Button>
                            <Button
                                onClick={() => setShowAddDialog(true)}
                                className="flex-1 sm:flex-none"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Supplier
                            </Button>
                        </div>
                    }
                />

                {/* Stats Cards */}
                <StatsCards stats={[
                    {
                        title: 'Total Supplier',
                        value: totalSuppliers.toString(),
                        icon: Users,
                        description: `${activeSuppliers} aktif`,
                        trend: { value: activeSuppliers, isPositive: activeSuppliers > 0 }
                    },
                    {
                        title: 'Total Pembelian',
                        value: `Rp ${totalSpent.toLocaleString('id-ID')}`,
                        icon: DollarSign,
                        description: 'Total nilai pembelian',
                        trend: { value: totalSpent, isPositive: totalSpent > 0 }
                    },
                    {
                        title: 'Rating Rata-rata',
                        value: avgRating.toFixed(1),
                        icon: TrendingUp,
                        description: 'Dari 5.0',
                        trend: { value: avgRating, isPositive: avgRating >= 4 }
                    },
                    {
                        title: 'Bahan Baku',
                        value: '-',
                        icon: Package,
                        description: 'Total item tersedia',
                        trend: { value: 0, isPositive: false }
                    }
                ]} />

                {/* Main Content */}
                <SuppliersCRUD />
            </div>
        </AppLayout>
    )
}

export default SuppliersPage
