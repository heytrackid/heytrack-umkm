"use client"

import { Calculator, Package, BarChart3, Shield, Users } from 'lucide-react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-6">
        
      {/* For signed-out users */}
      <SignedOut>
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8 w-full max-w-lg space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>HeyTrack Bakery Management</span>
              </div>
              <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-2xl">
                <Shield className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Mulai Mengelola UMKM Anda
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg">
                Bergabung dengan <span className="font-bold text-neutral-800 dark:text-neutral-200">500+ UMKM</span> yang sudah merasakan kemudahan sistem manajemen terlengkap
              </p>
            </div>
          </div>
          
          {/* Auth buttons */}
          <div className="space-y-4">
            <SignUpButton mode="modal">
              <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                Daftar Gratis Sekarang
              </button>
            </SignUpButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-neutral-800 text-neutral-500 font-medium">atau</span>
              </div>
            </div>
            
            <SignInButton mode="modal">
              <button className="w-full border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-neutral-700/50">
                Sudah Punya Akun? Masuk
              </button>
            </SignInButton>
          </div>
          
          {/* Features */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Yang Anda dapatkan:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calculator className="h-4 w-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">Kalkulator HPP otomatis</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-4 w-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">Smart inventory tracking</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BarChart3 className="h-4 w-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">Analisis finansial real-time</span>
              </div>
            </div>
          </div>
          
          {/* Trust badge */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 text-center space-y-3">
            <div className="flex justify-center items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Dipercaya 500+ UMKM</span>
            </div>
            <p className="text-xs text-neutral-500">
              © 2025 HeyTrack. Sistem manajemen UMKM terdepan di Indonesia.
            </p>
          </div>
        </div>
      </SignedOut>
      
      {/* For signed-in users */}
      <SignedIn>
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8 w-full max-w-lg space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-medium text-green-700 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>HeyTrack Dashboard</span>
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                <UserButton />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Selamat Datang Kembali!
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Siap mengelola bisnis Anda hari ini?
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="space-y-4">
            <a 
              href="/dashboard" 
              className="block w-full bg-neutral-900 hover:bg-neutral-800 text-white text-center font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Buka Dashboard Utama
            </a>
            
            <div className="grid grid-cols-2 gap-3">
              <a href="/recipes" className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:shadow-md transition-all duration-200 text-center group">
                <Calculator className="h-6 w-6 text-neutral-600 dark:text-neutral-400 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">Resep & HPP</span>
              </a>
              <a href="/inventory" className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:shadow-md transition-all duration-200 text-center group">
                <Package className="h-6 w-6 text-neutral-600 dark:text-neutral-400 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block">Inventory</span>
              </a>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 text-center">Ringkasan Bisnis Anda:</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">12</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Resep</div>
              </div>
              <div className="border-x border-neutral-200 dark:border-neutral-700">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">8</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Bahan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">24</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Order</div>
              </div>
            </div>
            
            <p className="text-xs text-neutral-500 mt-6 text-center">
              © 2025 HeyTrack. Sistem manajemen UMKM terdepan di Indonesia.
            </p>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}
