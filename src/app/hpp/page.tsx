'use client'

import AppLayout from '@/components/layout/app-layout'
import { PageHeader } from '@/components/shared'
import { UnifiedHppPage } from '@/modules/hpp'
import { useResponsive } from '@/hooks/useResponsive'

const hppBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing' }
]

export default function HppPage() {
  const { isMobile } = useResponsive()

  return (
    <AppLayout pageTitle="Hitung Biaya & Harga Jual">
      <div className={`container mx-auto p-6 space-y-6 ${isMobile ? 'pb-20' : ''}`}>
        <PageHeader
          title="💰 Hitung Biaya & Harga Jual"
          description="Hitung biaya produksi dan tentukan harga jual yang menguntungkan"
          breadcrumbs={hppBreadcrumbs}
        />

        <UnifiedHppPage />
      </div>
    </AppLayout>
  )
}
