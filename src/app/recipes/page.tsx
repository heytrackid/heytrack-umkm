'use client'

import { AppLayout } from '@/components/layout/app-layout'
import RecipesList from '@/components/recipes/RecipesList'

const RecipesPage = () => (
    <AppLayout pageTitle="Resep Produk">
        <div className="p-6">
            <RecipesList />
        </div>
    </AppLayout>
)

export default RecipesPage