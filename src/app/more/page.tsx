'use client'

import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Calculator,
  Warehouse,
  CreditCard,
  BarChart3,
  Settings,
  Receipt,
  Brain,
  Zap,
  ArrowRight
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: any
  description: string
  isSimple?: boolean
  color: string
}

const menuSections = [
  {
    title: 'UMKM Simple ⚡',
    description: 'Fitur lengkap yang mudah digunakan untuk UMKM',
    items: [
      {
        name: 'Resep',
        href: '/resep-simple',
        icon: ChefHat,
        description: 'Kelola resep dan formula produk dengan mudah',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      },
      {
        name: 'HPP Cepat',
        href: '/hpp-simple',
        icon: Calculator,
        description: 'Hitung harga pokok produksi dengan cepat',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      },
      {
        name: 'Bahan Baku',
        href: '/bahan-simple',
        icon: Package,
        description: 'Kelola stok bahan baku sederhana',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      },
      {
        name: 'Pesanan',
        href: '/pesanan-simple',
        icon: ShoppingCart,
        description: 'Kelola pesanan pelanggan dengan mudah',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      },
      {
        name: 'Pelanggan',
        href: '/pelanggan-simple',
        icon: Users,
        description: 'Database pelanggan dan riwayat pembelian',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      },
      {
        name: 'Pengeluaran',
        href: '/pengeluaran-simple',
        icon: Receipt,
        description: 'Catat pengeluaran harian dengan mudah',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      },
      {
        name: 'Laporan',
        href: '/laporan-simple',
        icon: BarChart3,
        description: 'Analisis keuangan dan performa bisnis',
        isSimple: true,
        color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
      }
    ]
  },
  {
    title: 'Main Features',
    description: 'Fitur utama sistem',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        description: 'Ringkasan bisnis dan analitik',
        color: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-800 border-blue-200 text-gray-700 dark:text-gray-300'
      },
      {
        name: 'AI Hub',
        href: '/ai',
        icon: Brain,
        description: 'Asisten AI untuk bisnis Anda',
        color: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-800 border-purple-200 text-gray-700 dark:text-gray-300'
      }
    ]
  }
]

export default function MorePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">HeyTrack UMKM</h1>
          <p className="text-muted-foreground text-lg">
            Sistem manajemen bakery yang mudah dan lengkap
          </p>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {section.title.includes('Simple') && (
                  <Zap className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
                {section.title}
              </h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item, itemIndex) => {
                const IconComponent = item.icon
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Card className={`transition-all duration-200 cursor-pointer ${item.color} border-2 hover:shadow-lg`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white/50">
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                  {item.name}
                                  {item.isSimple && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-600 text-white">
                                      SIMPLE
                                    </span>
                                  )}
                                </h3>
                              </div>
                            </div>
                            <p className="text-sm opacity-80 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 opacity-50 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 Sistem manajemen bakery yang <strong>mudah</strong> dan <strong>lengkap</strong> untuk UMKM Indonesia
          </p>
          <p className="text-xs text-muted-foreground">
            HeyTrack UMKM - Bakery Management System Simple
          </p>
        </div>
      </div>
    </AppLayout>
  )
}