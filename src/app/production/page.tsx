'use client'

import AppLayout from '@/components/layout/app-layout'
import { EnhancedProductionPage } from './components/EnhancedProductionPage'



const ProductionListPage = () => (
    <AppLayout pageTitle="Production Tracking">
        <EnhancedProductionPage />
    </AppLayout>
)

export default ProductionListPage
