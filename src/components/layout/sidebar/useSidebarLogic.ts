'use client'
import * as React from 'react'

import { apiLogger } from '@/lib/logger'
import {
  Bot,
  Calculator,
  ChefHat,
  DollarSign,
  Layers,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Sparkles
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface NavigationItem {
  name: string
  href: string
  icon: unknown
  isSimple?: boolean
  badge?: string
  stepNumber?: number
  description?: string
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
  description?: string
  isWorkflow?: boolean
  isCollapsible?: boolean
  defaultCollapsed?: boolean
}

export const useSidebarLogic = () => {
  const pathname = usePathname()
  const router = useRouter()

  // HPP Alerts count state
  const [hppAlertsCount, setHppAlertsCount] = useState(0)

  // Fetch HPP alerts count
  useEffect(() => {
    const fetchAlertsCount = async () => {
      try {
        const response = await fetch('/api/hpp/alerts?limit=1')
        if (response.ok) {
          const data = await response.json()
          setHppAlertsCount(data.meta?.unread_count || 0)
        }
      } catch (error) {
        apiLogger.error({ error: error }, 'Failed to fetch alerts count:')
      }
    }

    fetchAlertsCount()
    // Refetch every minute
    const interval = setInterval(fetchAlertsCount, 60000)
    return () => clearInterval(interval)
  }, [])

  // Collapsible sections state - initialize from localStorage if available
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed-sections')
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return {
      'Kelola Data': false,
      'Perhitungan': false,
      'Operasional': false,
      'Monitoring': false,
      'Asisten AI': false,
      'Analytics & Laporan': false,
      'Pengaturan': false,
    }
  })

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed-sections', JSON.stringify(collapsedSections))
    }
  }, [collapsedSections])

  // Prefetch next likely routes to reduce navigation latency
  useEffect(() => {
    const routesToPrefetch = [
      '/', '/orders', '/ingredients', '/hpp', '/resep', '/customers', 
      '/cash-flow', '/profit', '/ai-chatbot', '/reports', '/settings', 
      '/recipes/ai-generator'
    ]
    routesToPrefetch.forEach((r) => {
      try { router.prefetch(r) } catch { }
    })
  }, [router])

  const navigationSections: NavigationSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          name: "Dashboard",
          href: '/',
          icon: LayoutDashboard,
          description: "Ringkasan bisnis dan metrik utama"
        }
      ]
    },
    {
      title: "Kelola Data",
      description: "Kelola data dasar bisnis",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "Bahan Baku",
          href: '/ingredients',
          icon: Package,
          isSimple: true,
          badge: "DATA",
          stepNumber: 1,
          description: "Kelola bahan baku dan stok"
        },
        {
          name: "Kategori",
          href: '/categories',
          icon: Layers,
          isSimple: true,
          badge: "ORGANISIR",
          stepNumber: 2,
          description: "Kategori produk dan bahan"
        },
        {
          name: "Biaya Operasional",
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          badge: "BIAYA",
          stepNumber: 3,
          description: "Biaya operasional harian"
        },
        {
          name: "Resep",
          href: '/resep',
          icon: ChefHat,
          isSimple: true,
          badge: "RESEP",
          stepNumber: 4,
          description: "Formula resep dan komposisi"
        },
      ]
    },
    {
      title: "Perhitungan",
      description: "Hitung HPP dan strategi harga",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "Kalkulator HPP",
          href: '/hpp',
          icon: Calculator,
          isSimple: true,
          badge: "HITUNG",
          stepNumber: 1,
          description: "Perhitungan Harga Pokok Produksi"
        },
        {
          name: "HPP Lanjutan",
          href: '/hpp-enhanced',
          icon: Target,
          isSimple: true,
          badge: hppAlertsCount > 0 ? `${hppAlertsCount} ALERT` : "LANJUTAN",
          stepNumber: 2,
          description: "HPP dengan analisa mendalam"
        },
      ]
    },
    {
      title: "Operasional",
      description: "Kelola pesanan dan pelanggan",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "Pesanan",
          href: '/orders',
          icon: ShoppingCart,
          isSimple: true,
          badge: "ORDER",
          stepNumber: 1,
          description: "Kelola pesanan dan pengiriman"
        },
        {
          name: "Pelanggan",
          href: '/customers',
          icon: Users,
          isSimple: true,
          badge: "CRM",
          stepNumber: 2,
          description: "Database pelanggan dan riwayat"
        },
      ]
    },
    {
      title: "Monitoring",
      description: "Laporan keuangan dan profitabilitas",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "Arus Kas",
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          badge: "UANG",
          stepNumber: 1,
          description: "Semua transaksi masuk dan keluar"
        },
        {
          name: "Laba Riil",
          href: '/profit',
          icon: TrendingUp,
          isSimple: true,
          badge: "PROFIT",
          stepNumber: 2,
          description: "Profit margin dengan metode WAC"
        },
      ]
    },

    {
      title: "Asisten AI",
      description: "Bantuan cerdas untuk pengelolaan bisnis",
      items: [
        {
          name: "Chat AI",
          href: '/ai-chatbot',
          icon: Bot,
          description: "Tanya apa saja tentang bisnis bakery Anda"
        },
        {
          name: "Generator Resep",
          href: '/recipes/ai-generator',
          icon: Sparkles,
          description: "Buat resep baru dengan bantuan AI"
        }
      ]
    },
    {
      title: "Analytics & Laporan",
      description: "Laporan terperinci dan analitik",
      items: [
        {
          name: "Laporan Lengkap",
          href: '/reports',
          icon: FileText,
          description: "Lihat semua laporan dan analytics"
        }
      ]
    },
    {
      title: "Pengaturan",
      description: "Konfigurasi aplikasi",
      items: [
        {
          name: "Pengaturan Aplikasi",
          href: '/settings',
          icon: Settings,
          description: "Kelola pengaturan bisnis dan akun"
        }
      ]
    },
  ]

  const isItemActive = (item: NavigationItem): boolean => {
    return pathname === item.href ||
      (item.href.includes('#') && pathname === item.href.split('#')[0])
  }

  const prefetchRoute = (href: string) => {
    try {
      router.prefetch(href)
    } catch { }
  }

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const isSectionCollapsed = (sectionTitle: string): boolean => {
    return collapsedSections[sectionTitle] || false
  }

  return {
    navigationSections,
    pathname,
    router,
    isItemActive,
    prefetchRoute,
    toggleSection,
    isSectionCollapsed,
    collapsedSections
  }
}
