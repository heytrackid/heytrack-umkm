'use client'

import { 
  Package, 
  ChefHat, 
  ShoppingCart, 
  Calculator,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: string
  href: string
  color: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'ingredients',
    title: 'Tambah Bahan Baku',
    description: 'Mulai dengan menambahkan bahan baku yang Anda gunakan untuk produksi',
    icon: <Package className="h-8 w-8" />,
    action: 'Tambah Bahan',
    href: '/ingredients',
    color: 'bg-gray-500'
  },
  {
    id: 'recipes',
    title: 'Buat Resep Produk',
    description: 'Buat resep dengan komposisi bahan baku untuk menghitung biaya produksi',
    icon: <ChefHat className="h-8 w-8" />,
    action: 'Buat Resep',
    href: '/recipes/new',
    color: 'bg-gray-500'
  },
  {
    id: 'hpp',
    title: 'Hitung HPP & Harga Jual',
    description: 'Hitung biaya produksi dan tentukan harga jual yang menguntungkan',
    icon: <Calculator className="h-8 w-8" />,
    action: 'Hitung HPP',
    href: '/hpp',
    color: 'bg-gray-500'
  },
  {
    id: 'orders',
    title: 'Catat Pesanan Pertama',
    description: 'Mulai mencatat pesanan dan kelola penjualan Anda',
    icon: <ShoppingCart className="h-8 w-8" />,
    action: 'Buat Pesanan',
    href: '/orders',
    color: 'bg-orange-500'
  }
]

interface OnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const OnboardingWizard = ({ open, onOpenChange }: OnboardingWizardProps) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100

  const handleStepAction = (step: OnboardingStep) => {
    // Mark as completed
    if (!completedSteps.includes(step['id'])) {
      setCompletedSteps([...completedSteps, step['id']])
    }
    
    // Close wizard and navigate
    onOpenChange(false)
    router.push(step.href)
  }

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onOpenChange(false)
    // Store in localStorage that user skipped onboarding
    localStorage.setItem('heytrack_onboarding_skipped', 'true')
  }

  const currentStepData = ONBOARDING_STEPS[currentStep]

  if (!currentStepData) {return null}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Selamat Datang di HeyTrack! 👋
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Mari setup bisnis kuliner Anda dalam 4 langkah mudah
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress Setup</span>
            <span>{completedSteps.length} / {ONBOARDING_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Overview - Mini Cards */}
        <div className="grid grid-cols-4 gap-2">
          {ONBOARDING_STEPS.map((step, index) => (
            <button
              key={step['id']}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:border-primary',
                currentStep === index ? 'border-primary bg-primary/5' : 'border-transparent',
                completedSteps.includes(step['id']) && 'bg-gray-50 border-gray-300'
              )}
            >
              <div className={cn(
                'relative rounded-full p-2 text-white',
                completedSteps.includes(step['id']) ? 'bg-gray-500' : step.color
              )}>
                {completedSteps.includes(step['id']) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4">{step.icon}</div>
                )}
              </div>
              <span className="text-xs font-medium text-center line-clamp-2">
                {step.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Current Step Detail */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Step Icon & Title */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  'rounded-xl p-4 text-white flex-shrink-0',
                  currentStepData.color
                )}>
                  {currentStepData.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">
                      {currentStepData.title}
                    </h3>
                    {completedSteps.includes(currentStepData['id']) && (
                      <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                onClick={() => handleStepAction(currentStepData)}
                className="w-full"
              >
                {currentStepData.action}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {/* Tips */}
              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <strong>💡 Tips:</strong> {getStepTip(currentStepData['id'])}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Lewati Tutorial
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              Kembali
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === ONBOARDING_STEPS.length - 1}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getStepTip(stepId: string): string {
  const tips: Record<string, string> = {
    ingredients: 'Mulai dengan 5-10 bahan baku utama dulu. Anda bisa tambah lebih banyak nanti.',
    recipes: 'Gunakan AI Generator untuk membuat resep otomatis dari daftar bahan.',
    hpp: 'Pastikan harga bahan baku sudah akurat untuk perhitungan HPP yang tepat.',
    orders: 'Tambahkan customer terlebih dahulu untuk mempermudah pencatatan pesanan.'
  }
  return tips[stepId] ?? 'Ikuti langkah-langkah untuk setup yang optimal.'
}

export default OnboardingWizard
