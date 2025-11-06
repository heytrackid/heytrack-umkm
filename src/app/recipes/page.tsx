'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load the heavy recipes page component
const EnhancedRecipesPage = dynamic(
  () => import('@/components/recipes/EnhancedRecipesPage').then(mod => ({ default: mod.EnhancedRecipesPage })),
  {
    loading: () => <DataGridSkeleton rows={8} />,
    ssr: false
  }
)

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
