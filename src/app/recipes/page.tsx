'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { TableSkeleton } from '@/components/ui/skeleton-loader'

// Lazy load the heavy recipes page component
const RecipesList = dynamic(
  () => import('@/components/recipes/RecipesList'),
  {
    loading: () => <TableSkeleton rows={8} columns={5} />,
    ssr: false
  }
)

const RecipesPage = () => (
    <AppLayout pageTitle="Resep Produk">
        <div className="p-6">
            <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
                <RecipesList />
            </Suspense>
        </div>
    </AppLayout>
)

export default RecipesPage