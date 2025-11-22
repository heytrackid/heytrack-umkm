'use client'

import { DollarSign, TrendingUp, Truck, Upload, Users } from '@/components/icons'
import { useState } from 'react'

import { generateSuppliersTemplate, parseSuppliersCSV } from '@/components/import/csv-helpers'
import { ImportDialog } from '@/components/import/ImportDialog'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { SupplierForm } from '@/app/suppliers/components/SupplierForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { BreadcrumbPatterns, PageBreadcrumb, StatsCards } from '@/components/ui/index'
import { useCreateSupplier, useImportSuppliers, useSuppliers } from '@/hooks/useSuppliers'

import type { Supplier } from './components/types'

const SuppliersPage = (): JSX.Element => {
    const { data: suppliersData } = useSuppliers()
    const suppliers = suppliersData as Supplier[] | undefined
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const importSuppliersMutation = useImportSuppliers()
    const createSupplierMutation = useCreateSupplier()

    // Calculate stats
    const totalSuppliers = suppliers?.length ?? 0
    const activeSuppliers = suppliers?.filter((s) => s.is_active).length ?? 0
    const preferredSuppliers = suppliers?.filter((s) => s.supplier_type === 'preferred').length ?? 0
    const totalSpent = suppliers?.reduce((sum: number, s) =>
        sum + (Number(s.total_spent) || 0), 0
    ) ?? 0
    const avgRating = suppliers && suppliers.length > 0
        ? suppliers.reduce((sum: number, s) =>
            sum + (Number(s.rating) || 0), 0
        ) / suppliers.length
        : 0
    const avgLeadTime = suppliers && suppliers.length > 0
        ? suppliers.reduce((sum: number, s) =>
            sum + (Number(s.lead_time_days) || 0), 0
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
                                Import CSV
                            </Button>
                             <SupplierForm
                                 onSubmit={async (data) => {
                                     await createSupplierMutation.mutateAsync({
                                         ...data,
                                         contact_person: data.contact_person || null,
                                         phone: data.phone || null,
                                         email: data.email || null,
                                         address: data.address || null,
                                         notes: data.notes || null,
                                     })
                                 }}
                             />
                        </div>
                    }
                />

                {/* Stats Cards */}
                 <StatsCards stats={[
                     {
                         title: 'Total Supplier',
                         value: totalSuppliers.toString(),
                         icon: Users,
                         description: `${activeSuppliers} aktif, ${preferredSuppliers} preferred`,
                         trend: { value: activeSuppliers, isPositive: true }
                     },
                     {
                         title: 'Total Pembelian',
                         value: `Rp ${totalSpent.toLocaleString('id-ID')}`,
                         icon: DollarSign,
                         description: 'Total nilai pembelian',
                         trend: { value: totalSpent, isPositive: true }
                     },
                     {
                         title: 'Rating Rata-rata',
                         value: avgRating.toFixed(1),
                         icon: TrendingUp,
                         description: 'Dari 5.0',
                         trend: { value: avgRating, isPositive: avgRating >= 4 }
                     },
                     {
                         title: 'Lead Time Rata-rata',
                         value: avgLeadTime > 0 ? `${avgLeadTime.toFixed(1)} hari` : '-',
                         icon: Truck,
                         description: 'Waktu pengiriman',
                         trend: { value: avgLeadTime, isPositive: avgLeadTime <= 7 }
                     }
                 ]} />

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Supplier</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                     <TableRow>
                                         <TableHead>Nama</TableHead>
                                         <TableHead>Kontak</TableHead>
                                         <TableHead>Email</TableHead>
                                         <TableHead>Tipe</TableHead>
                                         <TableHead>Status</TableHead>
                                         <TableHead className="text-right">Rating</TableHead>
                                     </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!suppliers || suppliers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                Belum ada data supplier
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                         suppliers.map((supplier) => (
                                             <TableRow key={supplier.id}>
                                                 <TableCell className="font-medium">{supplier.name}</TableCell>
                                                 <TableCell>{supplier.contact_person ?? '-'}</TableCell>
                                                 <TableCell>{supplier.email ?? '-'}</TableCell>
                                                 <TableCell>
                                                     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                         supplier.supplier_type === 'preferred' ? 'bg-blue-100 text-blue-800' :
                                                         supplier.supplier_type === 'standard' ? 'bg-green-100 text-green-800' :
                                                         supplier.supplier_type === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                                         'bg-red-100 text-red-800'
                                                     }`}>
                                                         {supplier.supplier_type === 'preferred' ? 'Preferred' :
                                                          supplier.supplier_type === 'standard' ? 'Standard' :
                                                          supplier.supplier_type === 'trial' ? 'Trial' : 'Blacklisted'}
                                                     </span>
                                                 </TableCell>
                                                 <TableCell>
                                                     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                         supplier.is_active
                                                             ? 'bg-green-100 text-green-800'
                                                             : 'bg-gray-100 text-gray-800'
                                                     }`}>
                                                         {supplier.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                     </span>
                                                 </TableCell>
                                                 <TableCell className="text-right">
                                                     {supplier.rating ? `${supplier.rating}/5` : '-'}
                                                 </TableCell>
                                             </TableRow>
                                         ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

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
                            await importSuppliersMutation.mutateAsync(data)
                            return {
                                success: true,
                                count: data.length
                            }
                        } catch (error: unknown) {
                            return {
                                success: false,
                                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat import'
                            }
                        }
                    }}
                />
            </div>
        </AppLayout>
    )
}

export default SuppliersPage
