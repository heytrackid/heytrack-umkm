'use client'

import AppLayout from '@/components/layout/app-layout'
import { EnhancedProductionPage } from './components/EnhancedProductionPage'

export default function ProductionListPage() {
    return (
        <AppLayout pageTitle="Production Tracking">
            <EnhancedProductionPage />
        </AppLayout>
    )
}
