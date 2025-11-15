'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { TooltipHelper, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
import { UnifiedHppPage } from '@/modules/hpp/index'

const HppPage = (): JSX.Element => (
    <AppLayout>
      <div className="space-y-6 p-6">
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

export default HppPage