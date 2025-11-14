'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { logger } from '@/lib/logger'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load the heavy recipes page component
// ✅ Correct pattern for named exports (per Next.js docs)
const EnhancedRecipesPage = dynamic(
  () => import('@/components/recipes/EnhancedRecipesPage')
    .then(mod => mod.EnhancedRecipesPage)
    .catch((error) => {
      logger.error({ error }, 'Failed to load EnhancedRecipesPage')
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load recipes page</div> }
    }),
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