'use client'

import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { OperationalCostsList } from '@/components/operational-costs/OperationalCostsList'
import { TableSkeleton } from '@/components/ui/skeleton-loader'



const OperationalCostsPage = (): JSX.Element => (
  <AppLayout pageTitle="Biaya Operasional">
    <div className="p-6">
      <Suspense fallback={<TableSkeleton rows={8} columns={4} />}>
        <OperationalCostsList />
      </Suspense>
    </div>
  </AppLayout>
)

export default OperationalCostsPage