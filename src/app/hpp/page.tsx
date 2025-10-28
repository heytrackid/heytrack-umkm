'use client'

import AppLayout from '@/components/layout/app-layout'
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb'
import { UnifiedHppPage } from '@/modules/hpp'
import { TooltipHelper, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
import { Calculator } from 'lucide-react'

export default function HppPage() {
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.hpp} />

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-7 w-7 sm:h-8 sm:w-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Biaya Produksi (HPP)
            </h1>
            <TooltipHelper content={UMKM_TOOLTIPS.hpp} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Hitung biaya produksi dan tentukan harga jual yang menguntungkan. HPP = Biaya Bahan Baku + Tenaga Kerja + Operasional
          </p>
        </div>

        <UnifiedHppPage />
      </div>
    </AppLayout>
  )
}
