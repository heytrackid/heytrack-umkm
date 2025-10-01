'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ChefHat,
  Package,
  ShoppingCart,
  Users,
  Calculator,
  Receipt,
  BarChart3,
  TrendingUp,
  Settings,
  Target,
  DollarSign,
  Layers,
  Banknote,
  Brain,
  MessageSquare,
  Lightbulb
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: any
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
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'Kelola Data': false,
    'Perhitungan': false,
    'Operasional': false,
    'Monitoring': true, // Default collapsed to save space
    'Asisten AI': false,
  })

  // Prefetch next likely routes to reduce navigation latency
  useEffect(() => {
    const routesToPrefetch = ['/', '/orders', '/ingredients', '/hpp', '/finance', '/resep', '/customers']
    routesToPrefetch.forEach((r) => {
      try { router.prefetch(r) } catch {}
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
          description: "Kelola bahan baku dan stok"
        },
        {
          name: "Kategori",
          href: '/categories',
          icon: Layers,
          isSimple: true,
          badge: "ORGANISIR",
          description: "Kategori produk dan bahan"
        },
        {
          name: "Biaya Operasional",
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          badge: "BIAYA",
          description: "Biaya operasional harian"
        },
        {
          name: "Resep",
          href: '/resep',
          icon: ChefHat,
          isSimple: true,
          badge: "RESEP",
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
          description: "Perhitungan Harga Pokok Produksi"
        },
        {
          name: "HPP Lanjutan",
          href: '/hpp-enhanced',
          icon: Target,
          isSimple: true,
          badge: "LANJUTAN",
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
          description: "Kelola pesanan dan pengiriman"
        },
        {
          name: "Pelanggan",
          href: '/customers',
          icon: Users,
          isSimple: true,
          badge: "CRM",
          description: "Database pelanggan dan riwayat"
        },
      ]
    },
    {
      title: "Monitoring",
      description: "Laporan dan analisis bisnis",
      isWorkflow: true,
      isCollapsible: true,
      defaultCollapsed: true,
      items: [
        {
          name: "Arus Kas",
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          badge: "UANG",
          description: "Arus kas masuk dan keluar"
        },
        {
          name: "Keuangan",
          href: '/finance',
          icon: Banknote,
          isSimple: true,
          badge: "FINANCE",
          description: "Laporan keuangan detail"
        },
        {
          name: "Laporan",
          href: '/reports',
          icon: BarChart3,
          isSimple: true,
          badge: "REPORT",
          description: "Laporan bisnis lengkap"
        },
        {
          name: "Tinjauan",
          href: '/review',
          icon: TrendingUp,
          isSimple: true,
          badge: "REVIEW",
          description: "Tinjauan performa dan pertumbuhan"
        },
      ]
    },
    {
      title: 'Asisten AI',
      description: 'Asisten cerdas untuk optimasi bisnis',
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: 'Wawasan AI',
          href: '/ai',
          icon: Brain,
          isSimple: true,
          badge: 'PINTAR',
          description: 'Dashboard AI untuk analisis bisnis'
        },
        {
          name: 'Harga Pintar',
          href: '/ai/pricing',
          icon: TrendingUp,
          isSimple: true,
          badge: 'AI',
          description: 'Analisis harga optimal berbasis AI'
        },
        {
          name: 'Chat Asisten',
          href: '/ai/chat',
          icon: MessageSquare,
          isSimple: true,
          badge: 'BETA',
          description: 'Chatbot bisnis dengan AI'
        },
        {
          name: 'Tips Bisnis',
          href: '/ai/insights',
          icon: Lightbulb,
          isSimple: true,
          badge: 'BARU',
          description: 'Tips bisnis personal dari AI'
        }
      ]
    },
    {
      title: "Lainnya",
      items: [
        {
          name: "Pengaturan",
          href: '/settings',
          icon: Settings,
          description: "Pengaturan aplikasi dan preferensi"
        },
      ]
    }
  ]

  // Initialize collapsed sections based on defaultCollapsed
  useEffect(() => {
    const initialCollapsedState: Record<string, boolean> = {}
    navigationSections.forEach(section => {
      if (section.isCollapsible) {
        initialCollapsedState[section.title] = section.defaultCollapsed || false
      }
    })
    setCollapsedSections(prev => ({ ...prev, ...initialCollapsedState }))
  }, [])

  const isItemActive = (item: NavigationItem): boolean => {
    return pathname === item.href || 
      (item.href.includes('#') && pathname === item.href.split('#')[0])
  }

  const prefetchRoute = (href: string) => {
    try { 
      router.prefetch(href) 
    } catch {}
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
