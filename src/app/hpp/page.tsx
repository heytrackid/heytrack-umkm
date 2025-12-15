'use client'

import { Calculator } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { BreadcrumbPatterns, PageBreadcrumb } from '@/components/ui/index'
import { TooltipHelper, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
import { UnifiedHppPage } from '@/modules/hpp/index'

const HppPage = (): JSX.Element => {
  const router = useRouter()

  const handleWizardClick = () => {
    router.push('/hpp/calculator')
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.hpp} />

        <PageHeader
          title="Biaya Produksi (HPP)"
          description="Hitung biaya produksi dan tentukan harga jual yang menguntungkan. HPP = Biaya Bahan Baku + Tenaga Kerja + Operasional"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWizardClick}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Hitung HPP
              </Button>
              <TooltipHelper content={UMKM_TOOLTIPS.hpp} />
            </div>
          }
        />

        <UnifiedHppPage />
      </div>
    </AppLayout>
  )
}

export default HppPage