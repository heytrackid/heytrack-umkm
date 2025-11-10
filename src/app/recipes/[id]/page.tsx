'use client'

import { Suspense, use } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipeDetailPage } from '@/components/recipes/RecipeDetailPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'



interface RecipePageProps {
    params: Promise<{
        id: string
    }>
}

const RecipePage = ({ params }: RecipePageProps) => {
    const { id } = use(params)
    return (
        <AppLayout pageTitle="Detail Resep">
            <div className="p-6">
                <Suspense fallback={<DataGridSkeleton rows={8} />}>
                    <RecipeDetailPage recipeId={id} />
                </Suspense>
            </div>
        </AppLayout>
    )
}

export default RecipePage