'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { OperationalCostsList } from '@/components/operational-costs/OperationalCostsList'

const OperationalCostsPage = (): JSX.Element => (
  <AppLayout pageTitle="Biaya Operasional">
    <div className="p-6">
      <OperationalCostsList />
    </div>
  </AppLayout>
)

export default OperationalCostsPage