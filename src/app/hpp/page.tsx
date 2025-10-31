'use client'

import AppLayout from '@/components/layout/app-layout'
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb'
import { UnifiedHppPage } from '@/modules/hpp'
import { TooltipHelper, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
import { PageHeader } from '@/components/layout/PageHeader'

export default function HppPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.hpp} />

        {/* Header */}
        <PageHeader
          title="Biaya Produksi (HPP)"
          description="Hitung biaya produksi dan tentukan harga jual yang menguntungkan. HPP = Biaya Bahan Baku + Tenaga Kerja + Operasional"
          action={<TooltipHelper content={UMKM_TOOLTIPS.hpp} />}
        />

        <UnifiedHppPage />
      </div>
    </AppLayout>
  )
}
