'use client'

import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipeDetailPage } from '@/components/recipes/RecipeDetailPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'



interface RecipePageProps {
    params: {
        id: string
    }
}

const RecipePage = ({ params }: RecipePageProps) => (
    <AppLayout pageTitle="Detail Resep">
        <div className="p-6">
            <Suspense fallback={<DataGridSkeleton rows={8} />}>
                <RecipeDetailPage recipeId={params['id']} />
            </Suspense>
        </div>
    </AppLayout>
)

export default RecipePage