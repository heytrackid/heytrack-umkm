'use client'

import { Suspense } from 'react'
import { EnhancedOperationalCostsPage } from '@/components/operational-costs/EnhancedOperationalCostsPage'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

export default function OperationalCostsPage() {
  return (
    <AppLayout pageTitle="Biaya Operasional">
      <div className="p-6">
        <Suspense fallback={<DataGridSkeleton rows={8} />}>
          <EnhancedOperationalCostsPage />
        </Suspense>
      </div>
    </AppLayout>
  )
}
