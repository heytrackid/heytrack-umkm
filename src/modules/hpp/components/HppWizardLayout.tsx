'use client'

import { ArrowLeft, ArrowRight, Calculator, CheckCircle, DollarSign, Factory, Percent, Receipt } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/hooks/index'
import { handleError } from '@/lib/error-handling'
import { successToast, } from '@/hooks/use-toast'

import { RecipeSelector } from '@/modules/hpp/components/RecipeSelector'
import { useUnifiedHpp } from '@/modules/hpp/hooks/useUnifiedHpp'



// HPP Wizard Steps
const wizardSteps = [
  { id: 1, title: 'Pilih Resep', description: 'Pilih resep yang akan dihitung HPP-nya', icon: Receipt },
  { id: 2, title: 'Biaya Tambahan', description: 'Input biaya overhead dan operasional', icon: Factory },
  { id: 3, title: 'Set Margin', description: 'Tentukan margin keuntungan', icon: Percent },
  { id: 4, title: 'Review & Simpan', description: 'Periksa hasil dan simpan kalkulasi', icon: Calculator }
]

interface OverheadCosts {
  labor: number
  operational: number
  packaging: number
  other: number
}

export const HppWizardLayout = () => {
  const { isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = wizardSteps.length

  // HPP data
  const {
    recipes,
    recipe,
    recipeLoading,
    selectedRecipeId,
    setSelectedRecipeId,
    updatePrice
  } = useUnifiedHpp()

  // Step 2: Overhead costs
  const [overheadCosts, setOverheadCosts] = useState<OverheadCosts>({
    labor: 0,
    operational: 0,
    packaging: 0,
    other: 0
  })

  // Step 3: Margin
  const [marginPercentage, setMarginPercentage] = useState(50)

  // Swipe functionality for mobile
  const progressRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  // Calculate total overhead
  const totalOverhead = Object.values(overheadCosts).reduce((sum, cost) => sum + cost, 0)

  // Calculate final HPP and price
  const finalHpp = (recipe?.total_cost || 0) + totalOverhead
  const finalPrice = finalHpp * (1 + marginPercentage / 100)

  // Calculate price directly (no need for state)
  const calculatedPrice = recipe && finalHpp > 0 ? Math.round(finalPrice / 100) * 100 : 0

  const handleRecipeSelect = useCallback((recipeId: string) => {
    if (recipeId === 'new') {
      router.push('/recipes/new')
      return
    }
    setSelectedRecipeId(recipeId)
  }, [setSelectedRecipeId, router])

  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return selectedRecipeId && recipe
      case 2:
        return totalOverhead >= 0 // Allow 0 overhead
      case 3:
        return marginPercentage >= 0 && marginPercentage <= 200
      case 4:
        return true
      default:
        return false
    }
  }, [currentStep, selectedRecipeId, recipe, totalOverhead, marginPercentage])

  const handleNextStep = useCallback(() => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }, [canProceedToNextStep, currentStep, totalSteps])

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleStepClick = useCallback((stepId: number) => {
    // Allow going back to previous steps
    if (stepId < currentStep) {
      setCurrentStep(stepId)
    }
    // Allow going to next step only if current step is valid
    else if (stepId === currentStep + 1 && canProceedToNextStep()) {
      setCurrentStep(stepId)
    }
  }, [currentStep, canProceedToNextStep])

  // Swipe handlers for mobile progress indicator
  const minSwipeDistance = 50

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    if (e.targetTouches[0]) {
      setTouchStart(e.targetTouches[0].clientX)
    }
    setSwipeDirection(null)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return

    if (!e.targetTouches[0]) return
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)

    const distance = touchStart - currentTouch
    if (Math.abs(distance) > 20) { // Minimum distance for direction detection
      setSwipeDirection(distance > 0 ? 'left' : 'right')
    }
  }, [touchStart])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setSwipeDirection(null)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentStep < totalSteps && canProceedToNextStep()) {
      handleNextStep()
    } else if (isRightSwipe && currentStep > 1) {
      handlePrevStep()
    }

    setSwipeDirection(null)
  }, [touchStart, touchEnd, currentStep, totalSteps, canProceedToNextStep, handleNextStep, handlePrevStep])

  const handleSaveCalculation = useCallback(async () => {
    if (!recipe) return

    try {
      // Update price with new margin
      await updatePrice.mutateAsync({
        recipeId: recipe.id,
        price: calculatedPrice,
        margin: marginPercentage
      })

      successToast('Berhasil', 'Kalkulasi HPP berhasil disimpan!')
      router.push('/hpp')
    } catch (error) {
      handleError(error as Error, 'HPP Wizard: save calculation', true, 'Gagal menyimpan kalkulasi')
    }
  }, [recipe, calculatedPrice, marginPercentage, updatePrice, router])

  const getStepClassName = (stepId: number) => {
    if (stepId < currentStep) return 'bg-primary border-primary text-primary-foreground'
    if (stepId === currentStep) return 'border-primary text-primary bg-primary/10'
    return 'border-muted-foreground/30 text-muted-foreground'
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <PageHeader
            title="HPP Calculator Wizard"
            icon={
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-white" />
              </div>
            }
          />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="HPP Calculator Wizard"
          description="Panduan langkah demi langkah untuk menghitung biaya produksi yang akurat"
          icon={
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center">
              <Calculator className="h-7 w-7 text-white" />
            </div>
          }
        />

        {/* Wizard Progress Indicator */}
        <Card className="mb-6">
          <CardContent
            ref={progressRef}
            className={`pt-6 transition-all duration-200 ${
              swipeDirection === 'left' ? 'bg-blue-50/50 border-blue-200' :
              swipeDirection === 'right' ? 'bg-green-50/50 border-green-200' :
              ''
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Mobile: Vertical Stack (Stacked) */}
            <div className="md:hidden">
              <div className="flex flex-col space-y-0 mb-4">
                {wizardSteps.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep
                
                return (
                  <div key={step.id} className="relative pl-4 pb-4 last:pb-0">
                    {/* Vertical connecting line */}
                    {index < wizardSteps.length - 1 && (
                      <div className={`absolute left-[27px] top-10 bottom-0 w-[2px] ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                    
                    <div className="flex items-start gap-4 relative">
                      {/* Step Circle */}
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all z-10 mt-0.5 ${
                          isActive ? 'bg-primary border-primary text-primary-foreground' :
                          isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                          'bg-background border-muted text-muted-foreground'
                        }`}
                        onClick={() => handleStepClick(step.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleStepClick(step.id)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <span className="text-xs font-bold">{step.id}</span>
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div 
                        className={`flex-1 cursor-pointer transition-colors ${
                          isActive ? 'opacity-100' : 
                          isCompleted ? 'opacity-80' : 
                          'opacity-50'
                        }`}
                        onClick={() => handleStepClick(step.id)}
                      >
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </div>
                        {isActive && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {step.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            </div>

             {/* Tablet/Desktop: Horizontal Layout */}
             <div className="hidden md:flex items-center justify-between flex-nowrap mb-4">
              {wizardSteps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 cursor-pointer transition-all ${getStepClassName(step.id)}`}
                      onClick={() => handleStepClick(step.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleStepClick(step.id)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className={`text-sm font-medium ${
                        step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                    {index < wizardSteps.length - 1 && (
                      <div className={`flex-1 h-px mx-4 ${
                        step.id < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />

            {/* Swipe indicator for mobile */}
            {swipeDirection && (
              <div className={`mt-4 p-2 rounded-lg text-center text-sm font-medium transition-all duration-200 ${
                swipeDirection === 'left'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {swipeDirection === 'left' ? '⬅️ Swipe kiri untuk next step' : '➡️ Swipe kanan untuk prev step'}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Step Content */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Step 1: Recipe Selection */}
            {currentStep === 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <Receipt className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Pilih Resep</h3>
                      <p className="text-sm text-muted-foreground">
                        Pilih resep yang akan Anda hitung biaya produksinya
                      </p>
                    </div>
                    <RecipeSelector
                      recipes={recipes}
                      selectedRecipeId={selectedRecipeId}
                      onRecipeSelect={handleRecipeSelect}
                      isLoading={recipeLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Overhead Costs */}
            {currentStep === 2 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Factory className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Biaya Tambahan</h3>
                      <p className="text-sm text-muted-foreground">
                        Input biaya overhead dan operasional selain bahan baku
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="labor-cost">Biaya Tenaga Kerja (per porsi)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                          <Input
                            id="labor-cost"
                            type="number"
                            placeholder="0"
                            value={overheadCosts.labor || ''}
                            onChange={(e) => setOverheadCosts(prev => ({ ...prev, labor: Number(e.target.value) || 0 }))}
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operational-cost">Biaya Operasional (per porsi)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                          <Input
                            id="operational-cost"
                            type="number"
                            placeholder="0"
                            value={overheadCosts.operational || ''}
                            onChange={(e) => setOverheadCosts(prev => ({ ...prev, operational: Number(e.target.value) || 0 }))}
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="packaging-cost">Biaya Packaging (per porsi)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                          <Input
                            id="packaging-cost"
                            type="number"
                            placeholder="0"
                            value={overheadCosts.packaging || ''}
                            onChange={(e) => setOverheadCosts(prev => ({ ...prev, packaging: Number(e.target.value) || 0 }))}
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="other-cost">Biaya Lainnya (per porsi)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                          <Input
                            id="other-cost"
                            type="number"
                            placeholder="0"
                            value={overheadCosts.other || ''}
                            onChange={(e) => setOverheadCosts(prev => ({ ...prev, other: Number(e.target.value) || 0 }))}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Biaya Overhead:</span>
                        <span className="font-bold text-primary">Rp {totalOverhead.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Margin Setting */}
            {currentStep === 3 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Percent className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Set Margin Keuntungan</h3>
                      <p className="text-sm text-muted-foreground">
                        Tentukan persentase margin yang diinginkan untuk produk ini
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="margin-slider">Margin Keuntungan: {marginPercentage}%</Label>
                          <Input
                            id="margin-input"
                            type="number"
                            min="0"
                            max="200"
                            value={marginPercentage}
                            onChange={(e) => setMarginPercentage(Number(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                        <Slider
                          id="margin-slider"
                          min={0}
                          max={200}
                          step={5}
                          value={[marginPercentage]}
                          onValueChange={(value) => { if (value.length > 0 && value[0] !== undefined) setMarginPercentage(value[0]) }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                          <span>150%</span>
                          <span>200%</span>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span>Total HPP:</span>
                          <span className="font-medium">Rp {finalHpp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin ({marginPercentage}%):</span>
                          <span className="font-medium">Rp {(finalPrice - finalHpp).toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">Harga Jual Rekomendasi:</span>
                          <span className="font-bold text-primary">Rp {calculatedPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        💡 <strong>Rekomendasi:</strong> Margin 30-50% umumnya digunakan untuk bisnis kuliner. Margin di bawah 30% berisiko untuk sustainability.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Save */}
            {currentStep === 4 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Calculator className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Review Hasil Kalkulasi</h3>
                      <p className="text-sm text-muted-foreground">
                        Periksa hasil perhitungan dan simpan kalkulasi
                      </p>
                    </div>

                    {recipe && (
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Ringkasan Kalkulasi HPP</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Resep</h4>
                                <p className="text-sm text-muted-foreground">{recipe.name}</p>
                                <p className="text-xs text-muted-foreground">Untuk {recipe.servings} porsi</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Biaya Bahan Baku</h4>
                                <p className="text-sm font-medium">Rp {recipe.total_cost?.toLocaleString() || '0'}</p>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Biaya Tambahan</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Tenaga Kerja:</span>
                                  <span>Rp {overheadCosts.labor.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Operasional:</span>
                                  <span>Rp {overheadCosts.operational.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Packaging:</span>
                                  <span>Rp {overheadCosts.packaging.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Lainnya:</span>
                                  <span>Rp {overheadCosts.other.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium border-t pt-2">
                                  <span>Total Overhead:</span>
                                  <span>Rp {totalOverhead.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Hasil Akhir</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Total HPP:</span>
                                  <span className="font-bold">Rp {finalHpp.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Margin ({marginPercentage}%):</span>
                                  <span>Rp {(finalPrice - finalHpp).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between bg-primary/10 p-3 rounded-lg">
                                  <span className="font-bold">Harga Jual:</span>
                                  <span className="font-bold text-primary text-lg">Rp {calculatedPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Button
                          onClick={handleSaveCalculation}
                          className="w-full"
                          size="lg"
                          disabled={updatePrice.isPending}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {updatePrice.isPending ? 'Menyimpan...' : 'Simpan Kalkulasi HPP'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6 order-1 lg:order-2">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-4">Preview Kalkulasi</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Biaya Bahan Baku:</span>
                    <span className="text-sm font-medium">Rp {recipe?.total_cost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Biaya Overhead:</span>
                    <span className="text-sm font-medium">Rp {totalOverhead.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total HPP:</span>
                      <span className="text-sm font-bold">Rp {finalHpp.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Margin ({marginPercentage}%):</span>
                    <span className="text-sm font-medium">Rp {(finalPrice - finalHpp).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Harga Jual:</span>
                      <span className="text-sm font-bold text-primary">Rp {calculatedPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

         {/* Wizard Navigation */}
         <div className="pt-6 border-t">
           <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="text-sm text-muted-foreground">
              Langkah {currentStep} dari {totalSteps}
            </div>

            <Button
              onClick={handleNextStep}
              disabled={currentStep >= totalSteps || !canProceedToNextStep()}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps ? 'Selesai' : 'Selanjutnya'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}