'use client'

import { use } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipeDetailPage } from '@/components/recipes/RecipeDetailPage'

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
                <RecipeDetailPage recipeId={id} />
            </div>
        </AppLayout>
    )
}

export default RecipePage