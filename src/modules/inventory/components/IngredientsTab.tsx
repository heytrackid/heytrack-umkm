'use client'

import { SearchAndFilters } from './SearchAndFilters'
import { BulkActions } from './BulkActions'
import { InventoryTable } from './InventoryTable'
import { EducationalCards } from './EducationalCards'

interface IngredientsTabProps {
  filteredIngredients: any[]
  selectedItems: string[]
  searchTerm: string
  typeFilter: string
  onSearchChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
  onSelectAll: () => void
  onSelectItem: (itemId: string) => void
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  onEditIngredient: (ingredient: any) => void
  onDeleteIngredient: (ingredient: any) => void
  onShowPricingAnalysis: (ingredient: any) => void
  getStockAlertLevel: (ingredient: any) => { level: string, color: string, text: string }
}

/**
 * Ingredients tab component for inventory management
 */
export function IngredientsTab({
  filteredIngredients,
  selectedItems,
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  onSelectAll,
  onSelectItem,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  onEditIngredient,
  onDeleteIngredient,
  onShowPricingAnalysis,
  getStockAlertLevel
}: IngredientsTabProps) {
  return (
    <>
      {/* Search, Filter, and Bulk Actions */}
      <div className="space-y-4">
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          typeFilter={typeFilter}
          onTypeFilterChange={onTypeFilterChange}
        />

        <BulkActions
          selectedItems={selectedItems}
          filteredIngredients={filteredIngredients}
          onClearSelection={onClearSelection}
          onBulkEdit={onBulkEdit}
          onBulkDelete={onBulkDelete}
        />
      </div>

      {/* Ingredients Table with Pricing Analysis */}
      <InventoryTable
        ingredients={filteredIngredients}
        selectedItems={selectedItems}
        onSelectItem={onSelectItem}
        onSelectAll={onSelectAll}
        onEditIngredient={onEditIngredient}
        onDeleteIngredient={onDeleteIngredient}
        onShowPricingAnalysis={onShowPricingAnalysis}
        getStockAlertLevel={getStockAlertLevel}
      />

      {/* Educational Cards */}
      <EducationalCards />
    </>
  )
}
