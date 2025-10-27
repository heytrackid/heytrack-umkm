'use client'

import AppLayout from '@/components/layout/app-layout'
import { ProductionPage } from './components/ProductionPage'

export default function ProductionListPage() {
    return (
        <AppLayout pageTitle="Production Tracking">
            <ProductionPage />
        </AppLayout>
    )
}
