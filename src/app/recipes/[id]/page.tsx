'use client'

import { Suspense, use } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipeDetailPage } from '@/components/recipes/RecipeDetailPage'
import { CardSkeleton, ListSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loader'



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
                <Suspense
                    fallback={(
                        <div className="space-y-6">
                            <StatsSkeleton count={4} />
                            <CardSkeleton rows={6} />
                            <ListSkeleton items={5} />
                        </div>
                    )}
                >
                    <RecipeDetailPage recipeId={id} />
                </Suspense>
            </div>
        </AppLayout>
    )
}

export default RecipePage