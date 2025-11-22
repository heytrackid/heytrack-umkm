'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { EnhancedProductionPage } from './components/EnhancedProductionPage'

const ProductionListPage = (): JSX.Element => (
  <AppLayout pageTitle="Production Tracking">
    <EnhancedProductionPage />
  </AppLayout>
)

export default ProductionListPage