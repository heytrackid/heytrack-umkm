'use client'

import { Suspense } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { EnhancedOperationalCostsPage } from '@/components/operational-costs/EnhancedOperationalCostsPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'



const OperationalCostsPage = () => (
  <AppLayout pageTitle="Biaya Operasional">
    <div className="p-6">
      <Suspense fallback={<DataGridSkeleton rows={8} />}>
        <EnhancedOperationalCostsPage />
      </Suspense>
    </div>
  </AppLayout>
)

export default OperationalCostsPage
