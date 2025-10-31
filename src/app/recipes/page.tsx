'use client'

import { Suspense } from 'react'
import { EnhancedRecipesPage } from '@/components/recipes/EnhancedRecipesPage'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

const RecipesPage = () => (
    <AppLayout pageTitle="Resep Produk">
        <div className="p-6">
            <Suspense fallback={<DataGridSkeleton rows={8} />}>
                <EnhancedRecipesPage />
            </Suspense>
        </div>
    </AppLayout>
)

export default RecipesPage
