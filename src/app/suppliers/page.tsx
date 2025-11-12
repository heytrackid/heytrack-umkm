'use client'

import { DollarSign, Package, TrendingUp, Upload, Users } from 'lucide-react'
import { useState } from 'react'

import { SuppliersCRUD } from '@/components/crud/suppliers-crud'
import { generateSuppliersTemplate, parseSuppliersCSV } from '@/components/import/csv-helpers'
import { ImportDialog } from '@/components/import/ImportDialog'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'

import { BreadcrumbPatterns, PageBreadcrumb, PageHeader, StatsCards } from '@/components/ui/index'
import { useSupabaseCRUD } from '@/hooks/supabase/index'

import type { Row } from '@/types/database'

const SuppliersPage = (): JSX.Element => {
    const { data: suppliers } = useSupabaseCRUD('suppliers')
    const [importDialogOpen, setImportDialogOpen] = useState(false)

    // Calculate stats
    const totalSuppliers = suppliers?.length ?? 0
    const activeSuppliers = suppliers?.filter((s: Row<'suppliers'>) => s.is_active).length ?? 0
    const totalSpent = suppliers?.reduce((sum: number, s: Row<'suppliers'>) =>
        sum + (Number(s.total_spent) || 0), 0
    ) ?? 0
    const avgRating = suppliers && suppliers.length > 0
        ? suppliers.reduce((sum: number, s: Row<'suppliers'>) =>
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
                        <div className="flex items-center gap-2">

                          <Button
                            variant="outline"
                            onClick={() => setImportDialogOpen(true)}
                            className="flex-1 sm:flex-none"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
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

                {/* Import Dialog */}
                <ImportDialog
                    open={importDialogOpen}
                    onOpenChange={setImportDialogOpen}
                    title="Import Supplier"
                    description="Upload file CSV untuk import data supplier secara massal"
                    templateUrl={`data:text/csv;charset=utf-8,${encodeURIComponent(generateSuppliersTemplate())}`}
                    templateFilename="template-supplier.csv"
                    parseCSV={parseSuppliersCSV}
                    onImport={async (data) => {
                        try {
                            const response = await fetch('/api/suppliers/import', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ suppliers: data }),
                                credentials: 'include', // Include cookies for authentication
                            })

                            const result = await response.json() as { error?: string; details?: unknown[]; count?: number }

                            if (!response.ok) {
                                return {
                                    success: false,
                                    error: result.error ?? 'Import gagal',
                                    details: result.details || []
                                }
                            }

                            return {
                                success: true,
                                ...(result.count !== undefined && { count: result.count })
                            }
                         } catch {
                            return {
                                success: false,
                                error: 'Terjadi kesalahan saat import'
                            }
                        }
                    }}
                />
            </div>
        </AppLayout>
    )
}

export default SuppliersPage