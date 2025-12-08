'use client'

import { ChefHat } from '@/components/icons'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'

// Split components
import { AIGeneratorActions } from './AIGeneratorActions'
import { AIGeneratorPreview } from './AIGeneratorPreview'
import { BatchGenerator } from './BatchGenerator'
import { GenerationProgress } from './GenerationProgress'
import { LivePreview } from './LivePreview'
import { ProductDetailsForm } from './ProductDetailsForm'
import { RecipeHistory } from './RecipeHistory'
import { RecipeTemplates } from './RecipeTemplates'
import { RecipeVariations } from './RecipeVariations'
import { UnifiedIngredientInput } from './UnifiedIngredientInput'
import { useAIRecipeGenerator } from './useAIRecipeGenerator'

import type { RecipeTemplate } from './RecipeTemplates'
import type { VariationType } from './types'

/**
 * AI Recipe Generator Page
 * 
 * Refactored for better maintainability:
 * - useAIRecipeGenerator: All business logic
 * - RecipeTemplates: Quick start templates
 * - ProductDetailsForm: Product details form fields
 * - AIGeneratorActions: Action buttons
 * - LivePreview: Real-time preview card
 * - AIGeneratorPreview: Generation result display
 */

const AIRecipeGeneratorPage = () => {
  const {
    // Auth state
    isAuthLoading,
    isAuthenticated,

    // Form state
    formState,
    updateFormField,
    resetForm,

    // Validation
    isFormValid,
    isProductNameValid,
    isIngredientsValid,
    isServingsValid,
    isTargetPriceValid,

    // Data
    availableIngredients,
    generatedRecipe,

    // UI state
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    lastSaved,
    uiError,
    setUiError,

    // Actions
    handleGenerate,
    handleSaveRecipe,
    saveDraft,

    // Enhanced features
    handleGenerateVariation,
    handleBatchGenerate,
    handleRestoreRecipe,

    // Progress tracking
    generationProgress,

    // Mutation state
    isGenerating,
    isWorkerProcessing
  } = useAIRecipeGenerator()

  // Handle template selection
  const handleSelectTemplate = (template: RecipeTemplate) => {
    updateFormField('productName', template.name)
    updateFormField('productType', template.type)
    updateFormField('servings', template.servings)
    updateFormField('customIngredients', template.ingredients)
  }

  // Loading state
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-white animate-pulse" />
            </div>
            <p className="text-muted-foreground">Memuat Generator Resep AI...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Redirecting to login...</div>
        </div>
      </AppLayout>
    )
  }

  const showTemplates = !formState.productName && 
    formState.selectedIngredients.length === 0 && 
    formState.customIngredients.length === 0

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Error display */}
        {uiError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{uiError}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setUiError(null)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-4 space-y-6">
          {/* Header */}
          <PageHeader
            title={
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                AI Resep UMKM
              </span>
            }
            description="✨ Buat resep kuliner UMKM profesional dengan AI dalam hitungan detik"
            icon={
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
            }
          />

          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-card/50 rounded-xl p-4 border shadow-sm gap-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {lastSaved && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Draft tersimpan {lastSaved.toLocaleTimeString('id-ID')}</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Perubahan belum tersimpan</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>💡 Auto-save aktif • Minimal 3 bahan untuk generate</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-card rounded-xl p-1 border shadow-sm w-full max-w-md">
              <div className="flex gap-1">
                <Button
                  variant={activeTab === 'input' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('input')}
                  className={`px-4 py-2 flex-1 text-sm transition-all duration-200 ${
                    activeTab === 'input'
                      ? 'shadow-sm transform scale-[1.02]'
                      : 'hover:bg-accent'
                  }`}
                >
                  📝 Input Resep
                </Button>
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('preview')}
                  disabled={!generatedRecipe && !isGenerating}
                  className={`px-4 py-2 flex-1 text-sm transition-all duration-200 ${
                    activeTab === 'preview'
                      ? 'shadow-sm transform scale-[1.02]'
                      : 'hover:bg-accent disabled:opacity-50'
                  }`}
                >
                  👀 Preview & Hasil
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
            {/* Input Panel */}
            {activeTab === 'input' && (
              <div className="space-y-6 lg:col-span-7 w-full">
                {/* Live Preview */}
                <LivePreview
                  productName={formState.productName}
                  productType={formState.productType}
                  servings={formState.servings}
                  targetPrice={formState.targetPrice}
                  selectedIngredients={formState.selectedIngredients}
                  customIngredients={formState.customIngredients}
                  availableIngredients={availableIngredients}
                  isFormValid={isFormValid}
                />

                {/* Quick Start Templates */}
                {showTemplates && (
                  <RecipeTemplates onSelectTemplate={handleSelectTemplate} />
                )}

                {/* Product Details */}
                <ProductDetailsForm
                  productName={formState.productName}
                  productType={formState.productType}
                  servings={formState.servings}
                  targetPrice={formState.targetPrice}
                  specialInstructions={formState.specialInstructions}
                  isProductNameValid={isProductNameValid}
                  isServingsValid={isServingsValid}
                  isTargetPriceValid={isTargetPriceValid}
                  disabled={isGenerating}
                  onProductNameChange={(v) => updateFormField('productName', v)}
                  onProductTypeChange={(v) => updateFormField('productType', v)}
                  onServingsChange={(v) => updateFormField('servings', v)}
                  onTargetPriceChange={(v) => updateFormField('targetPrice', v)}
                  onSpecialInstructionsChange={(v) => updateFormField('specialInstructions', v)}
                />

                {/* Ingredients */}
                <UnifiedIngredientInput
                  availableIngredients={availableIngredients.map(ing => ({
                    id: ing.id,
                    name: ing.name,
                    unit: ing.unit,
                    price_per_unit: ing.price_per_unit,
                    current_stock: ing.current_stock ?? 0,
                    ...(ing.minimum_stock !== undefined && { minimum_stock: ing.minimum_stock })
                  }))}
                  selectedIngredients={formState.selectedIngredients}
                  customIngredients={formState.customIngredients}
                  onSelectionChange={(v) => updateFormField('selectedIngredients', v)}
                  onCustomIngredientsChange={(v) => updateFormField('customIngredients', v)}
                  productType={formState.productType}
                  disabled={isGenerating}
                />

                {/* Action Buttons */}
                <AIGeneratorActions
                  isFormValid={isFormValid}
                  isGenerating={isGenerating}
                  isProductNameValid={isProductNameValid}
                  isIngredientsValid={isIngredientsValid}
                  isServingsValid={isServingsValid}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onGenerate={handleGenerate}
                  onSaveDraft={saveDraft}
                  onReset={resetForm}
                />
              </div>
            )}

            {/* Preview Panel */}
            <div className="space-y-6 lg:col-span-5 w-full">
              {/* Generation Progress */}
              {(isGenerating || generationProgress) && (
                <GenerationProgress 
                  progress={generationProgress} 
                  className="mb-4"
                />
              )}

              <AIGeneratorPreview
                isGenerating={isGenerating}
                generatedRecipe={generatedRecipe}
                activeTab={activeTab}
                availableIngredients={availableIngredients}
                onSave={handleSaveRecipe}
                onGenerateAgain={resetForm}
              />

              {/* Recipe Variations - show when recipe is generated */}
              {generatedRecipe && !isGenerating && (
                <RecipeVariations
                  baseRecipe={generatedRecipe}
                  onGenerateVariation={async (type: VariationType) => {
                    await handleGenerateVariation(type)
                  }}
                  isGenerating={isWorkerProcessing}
                />
              )}

              {/* Recipe History */}
              <RecipeHistory
                onSelectRecipe={(recipe) => handleRestoreRecipe(recipe)}
                onRestoreRecipe={(recipe) => handleRestoreRecipe(recipe)}
              />

              {/* Batch Generator - collapsible */}
              <BatchGenerator
                availableIngredients={availableIngredients.map(ing => ing.name)}
                onGenerateBatch={handleBatchGenerate}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export { AIRecipeGeneratorPage }
