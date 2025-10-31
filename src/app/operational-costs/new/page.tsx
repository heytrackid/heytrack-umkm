'use client'

import { Suspense } from 'react'
import { OperationalCostFormPage } from '@/components/operational-costs/OperationalCostFormPage'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

export default function NewOperationalCostPage() {
    return (
        <AppLayout pageTitle="Tambah Biaya Operasional">
            <div className="p-6">
                <Suspense fallback={<DataGridSkeleton rows={6} />}>
                    <OperationalCostFormPage mode="create" />
                </Suspense>
            </div>
        </AppLayout>
    )
}
