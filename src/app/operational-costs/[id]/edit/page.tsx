'use client'

import { Suspense } from 'react'
import { OperationalCostFormPage } from '@/components/operational-costs/OperationalCostFormPage'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

interface EditOperationalCostPageProps {
    params: {
        id: string
    }
}

export default function EditOperationalCostPage({ params }: EditOperationalCostPageProps) {
    return (
        <AppLayout pageTitle="Edit Biaya Operasional">
            <div className="p-6">
                <Suspense fallback={<DataGridSkeleton rows={6} />}>
                    <OperationalCostFormPage mode="edit" costId={params.id} />
                </Suspense>
            </div>
        </AppLayout>
    )
}
