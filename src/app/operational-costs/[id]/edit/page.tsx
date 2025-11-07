'use client'
 

import { Suspense } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { OperationalCostFormPage } from '@/components/operational-costs/OperationalCostFormPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'



interface EditOperationalCostPageProps {
    params: {
        id: string
    }
}

const EditOperationalCostPage = ({ params }: EditOperationalCostPageProps) => (
    <AppLayout pageTitle="Edit Biaya Operasional">
        <div className="p-6">
            <Suspense fallback={<DataGridSkeleton rows={6} />}>
                <OperationalCostFormPage mode="edit" costId={params['id']} />
            </Suspense>
        </div>
    </AppLayout>
)

export default EditOperationalCostPage
