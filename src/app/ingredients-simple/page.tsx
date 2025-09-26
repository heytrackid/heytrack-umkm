'use client'

import { IngredientsCRUD } from '@/components/crud/ingredients-crud'

export default function IngredientsSimplePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
          <p className="text-gray-600">Manage your bakery ingredients and stock levels</p>
        </div>
      </div>

      <IngredientsCRUD />
    </div>
  )
}