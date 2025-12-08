'use client'

import {
    ArrowRight,
    BarChart3,
    Calculator,
    ChefHat,
    Package,
    ShoppingCart,
    Sparkles,
    Users,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface WelcomeModalProps {
  onComplete?: () => void
}

const FEATURES = [
  {
    icon: Package,
    title: 'Kelola Bahan Baku',
    description: 'Track stok dan harga bahan dengan mudah',
    color: 'bg-blue-500',
  },
  {
    icon: ChefHat,
    title: 'Buat Resep dengan AI',
    description: 'Generate resep otomatis dengan AI',
    color: 'bg-purple-500',
  },
  {
    icon: Calculator,
    title: 'Hitung HPP Otomatis',
    description: 'Kalkulasi biaya produksi akurat',
    color: 'bg-green-500',
  },
  {
    icon: ShoppingCart,
    title: 'Catat Pesanan',
    description: 'Kelola order dari pelanggan',
    color: 'bg-orange-500',
  },
  {
    icon: Users,
    title: 'Manajemen Pelanggan',
    description: 'Database pelanggan terintegrasi',
    color: 'bg-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Laporan & Analisis',
    description: 'Insight bisnis real-time',
    color: 'bg-cyan-500',
  },
]

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  // Check if user has seen welcome modal
  useEffect(() => {
    // Check all possible onboarding keys to prevent showing again
    const hasSeenWelcome = localStorage.getItem('heytrack_welcome_completed')
    const hasSkippedOnboarding = localStorage.getItem('heytrack_onboarding_skipped')
    const hasCompletedOnboarding = localStorage.getItem('heytrack_onboarding_completed')
    
    // If any of these are set, don't show the modal
    if (hasSeenWelcome || hasSkippedOnboarding || hasCompletedOnboarding) {
      return undefined
    }
    
    // Delay showing modal for better UX
    const timer = setTimeout(() => setOpen(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleComplete = () => {
    // Set all onboarding keys to prevent any modal from showing again
    localStorage.setItem('heytrack_welcome_completed', 'true')
    localStorage.setItem('heytrack_onboarding_completed', 'true')
    setOpen(false)
    onComplete?.()
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  // Handle dialog close (including X button)
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // User closed the dialog (via X button or clicking outside)
      // Mark as completed so it doesn't show again
      handleComplete()
    }
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="p-6 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl">
                Selamat Datang di HeyTrack! 🎉
              </DialogTitle>
              <DialogDescription className="text-base">
                Platform manajemen bisnis kuliner yang akan membantu Anda mengoptimalkan operasional dan meningkatkan profit.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">💡 Tahukah Anda?</strong>
                <br />
                UMKM kuliner yang menggunakan sistem manajemen digital dapat meningkatkan efisiensi hingga 40% dan mengurangi food waste hingga 25%.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Lewati
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Mulai Tour
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Features Overview */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Fitur Utama HeyTrack ✨
              </DialogTitle>
              <DialogDescription>
                Semua yang Anda butuhkan untuk mengelola bisnis kuliner
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('p-2 rounded-lg text-white', feature.color)}>
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>
                Kembali
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Getting Started */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Langkah Awal 🚀
              </DialogTitle>
              <DialogDescription>
                Ikuti 4 langkah mudah untuk memulai
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {[
                { num: 1, title: 'Tambah Bahan Baku', desc: 'Input bahan yang Anda gunakan', href: '/ingredients' },
                { num: 2, title: 'Buat Resep', desc: 'Buat resep produk Anda', href: '/recipes/new' },
                { num: 3, title: 'Hitung HPP', desc: 'Kalkulasi biaya produksi', href: '/hpp' },
                { num: 4, title: 'Catat Pesanan', desc: 'Mulai terima pesanan', href: '/orders/new' },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {item.num}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <p className="text-sm">
                <strong>💬 Butuh bantuan?</strong>
                <br />
                <span className="text-muted-foreground">
                  Klik ikon chat di pojok kanan bawah untuk panduan interaktif kapan saja.
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Kembali
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Mulai Sekarang!
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                step === i ? 'bg-primary w-6' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
