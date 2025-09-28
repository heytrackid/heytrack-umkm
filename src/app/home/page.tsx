import type { Metadata } from 'next'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Calculator, Package, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InteractiveGridPattern } from '@/registry/magicui/interactive-grid-pattern'

export const metadata: Metadata = {
  title: 'HeyTrack Bakery Management',
  description: 'Sistem manajemen kuliner UMKM terlengkap',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden">
      {/* Interactive Grid Pattern Background */}
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-neutral-300/20 stroke-neutral-300/20 dark:fill-neutral-700/20 dark:stroke-neutral-700/20"
        )}
      />
      
      {/* Main Content - 2 Column Layout */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Hero Title */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                HeyTrack
                <span className="block text-neutral-600 dark:text-neutral-400">Bakery Management</span>
              </h1>
              
              <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                Sistem manajemen kuliner UMKM terlengkap dengan kalkulator HPP, inventory tracking, dan analisis finansial otomatis.
              </p>
            </div>
            
            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Kalkulator HPP otomatis dan akurat</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Smart inventory dengan peringatan stok</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Analisis finansial dan optimasi biaya</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-neutral-700 dark:text-neutral-300">Laporan real-time untuk pengambilan keputusan</span>
              </div>
            </div>
            
            {/* Auth-specific CTA */}
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <SignInButton>
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold transition-colors dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                    Masuk ke Akun
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-neutral-300 hover:border-neutral-400 rounded-lg font-semibold transition-colors dark:border-neutral-700 dark:hover:border-neutral-600">
                    Daftar Gratis
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            <SignedIn>
              <div className="p-6 bg-green-50/80 dark:bg-green-900/20 backdrop-blur border border-green-200 dark:border-green-800 rounded-2xl">
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Selamat Datang Kembali! 👋
                </h2>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Anda sudah masuk ke sistem HeyTrack. Mari mulai kelola bisnis kuliner Anda.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <a href="/dashboard" className="flex items-center gap-2 p-3 bg-white/60 dark:bg-neutral-900/60 backdrop-blur rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all">
                    <Calculator className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </a>
                  <a href="/test-api" className="flex items-center gap-2 p-3 bg-white/60 dark:bg-neutral-900/60 backdrop-blur rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all">
                    <Package className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    <span className="text-sm font-medium">Test API</span>
                  </a>
                </div>
              </div>
            </SignedIn>
            
            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">500+</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">UMKM Pengguna</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">99%</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Kepuasan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">24/7</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Support</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Features Showcase */}
          <div className="space-y-6">
            {/* Feature Cards */}
            <div className="grid gap-4">
              <div className="p-6 bg-white/60 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <Calculator className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">HPP Calculator</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Hitung harga pokok produksi dengan akurat untuk semua produk kuliner Anda.
                </p>
              </div>
              
              <div className="p-6 bg-white/60 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <Package className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Smart Inventory</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Kelola stok bahan baku dengan sistem peringatan otomatis dan prediksi kebutuhan.
                </p>
              </div>
              
              <div className="p-6 bg-white/60 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Financial Analytics</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Analisis keuntungan dan optimasi biaya operasional dengan laporan real-time.
                </p>
              </div>
            </div>
            
            {/* Trust Badge */}
            <div className="p-6 bg-neutral-100/60 dark:bg-neutral-800/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 rounded-2xl text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Dipercaya oleh UMKM di seluruh Indonesia
              </p>
              <div className="flex justify-center items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                  <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                  <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-500">+500 UMKM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-sm text-neutral-500 border-t border-neutral-200 dark:border-neutral-800">
        <p>&copy; 2025 HeyTrack. Sistem manajemen UMKM terdepan.</p>
      </footer>
    </div>
  )
}
