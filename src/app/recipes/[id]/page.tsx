'use client'

import { Suspense } from 'react'
import { RecipeDetailPage } from '@/components/recipes/RecipeDetailPage'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

interface RecipePageProps {
    params: {
        id: string
    }
}

export default function RecipePage({ params }: RecipePageProps) {
    return (
        <AppLayout pageTitle="Detail Resep">
            <div className="p-6">
                <Suspense fallback={<DataGridSkeleton rows={8} />}>
                    <RecipeDetailPage recipeId={params.id} />
                </Suspense>
            </div>
        </AppLayout>
    )
}
