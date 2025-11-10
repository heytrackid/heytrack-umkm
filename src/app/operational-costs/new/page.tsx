'use client'

import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { OperationalCostFormPage } from '@/components/operational-costs/OperationalCostFormPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'



const NewOperationalCostPage = (): JSX.Element => (
    <AppLayout pageTitle="Tambah Biaya Operasional">
        <div className="p-6">
            <Suspense fallback={<DataGridSkeleton rows={6} />}>
                <OperationalCostFormPage mode="create" />
            </Suspense>
        </div>
    </AppLayout>
)

export default NewOperationalCostPage