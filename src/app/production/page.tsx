'use client'

import AppLayout from '@/components/layout/app-layout'
import ProductionPage from './components/ProductionPage'

export default function Page() {
  return (
    <AppLayout>
      <div className="p-6">
        <ProductionPage />
      </div>
    </AppLayout>
  )
}
