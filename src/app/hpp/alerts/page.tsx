'use client'

import AppLayout from '@/components/layout/app-layout'
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb'
import { HppAlertsTab } from '@/modules/hpp/components/HppAlertsTab'
import { PageHeader } from '@/components/layout/PageHeader'

const HppAlertsPage = () => (
  <AppLayout>
    <div className="space-y-6 p-6">
      <PageBreadcrumb items={BreadcrumbPatterns.hppAlerts} />

      {/* Header */}
      <PageHeader
        title="Peringatan HPP"
        description="Pantau peringatan dan notifikasi terkait biaya produksi produk Anda"
      />

      <HppAlertsTab />
    </div>
  </AppLayout>
)

export default HppAlertsPage