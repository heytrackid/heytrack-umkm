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
    'Data Manager': false,
    'Calculation': false,
    'Operations': false,
    'Monitoring': true, // Default collapsed to save space
    'AI Assistant': false,
  })

  // Prefetch next likely routes to reduce navigation latency
  useEffect(() => {
    const routesToPrefetch = ['/', '/orders', '/inventory', '/hpp', '/finance', '/resep', '/customers']
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
          description: "Overview bisnis dan metrics utama"
        }
      ]
    },
    {
      title: "Data Manager",
      description: "Kelola data dasar bisnis",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "Raw Materials",
          href: '/inventory',
          icon: Package,
          isSimple: true,
          badge: "DATA",
          description: "Kelola bahan baku dan stok"
        },
        {
          name: "Categories",
          href: '/categories',
          icon: Layers,
          isSimple: true,
          badge: "ORGANIZE",
          description: "Kategori produk dan bahan"
        },
        {
          name: "Operational Costs",
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          badge: "COSTS",
          description: "Biaya operasional harian"
        },
        {
          name: "Recipes",
          href: '/resep',
          icon: ChefHat,
          isSimple: true,
          badge: "RECIPE",
          description: "Formula resep dan ingredients"
        },
      ]
    },
    {
      title: "Calculation",
      description: "Hitung HPP dan pricing strategy",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "HPP Pricing",
          href: '/hpp',
          icon: Calculator,
          isSimple: true,
          badge: "CALC",
          description: "Perhitungan Harga Pokok Produksi"
        },
        {
          name: "HPP Enhanced",
          href: '/hpp-enhanced',
          icon: Target,
          isSimple: true,
          badge: "ENHANCED",
          description: "HPP dengan analisa mendalam"
        },
      ]
    },
    {
      title: "Operations",
      description: "Kelola pesanan dan customer",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "Orders",
          href: '/orders',
          icon: ShoppingCart,
          isSimple: true,
          badge: "ORDER",
          description: "Kelola pesanan dan delivery"
        },
        {
          name: "Customers",
          href: '/customers',
          icon: Users,
          isSimple: true,
          badge: "CRM",
          description: "Database customer dan history"
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
          name: "Cash Flow",
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          badge: "MONEY",
          description: "Arus kas masuk dan keluar"
        },
        {
          name: "Finance",
          href: '/finance',
          icon: Banknote,
          isSimple: true,
          badge: "FINANCE",
          description: "Laporan keuangan detail"
        },
        {
          name: "Reports",
          href: '/reports',
          icon: BarChart3,
          isSimple: true,
          badge: "REPORT",
          description: "Laporan bisnis comprehensive"
        },
        {
          name: "Review",
          href: '/review',
          icon: TrendingUp,
          isSimple: true,
          badge: "REVIEW",
          description: "Review performa dan growth"
        },
      ]
    },
    {
      title: 'AI Assistant',
      description: 'Asisten cerdas untuk optimasi bisnis',
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: 'AI Insights',
          href: '/ai',
          icon: Brain,
          isSimple: true,
          badge: 'SMART',
          description: 'Dashboard AI untuk analisis bisnis cerdas'
        },
        {
          name: 'Smart Pricing',
          href: '/ai/pricing',
          icon: TrendingUp,
          isSimple: true,
          badge: 'AI',
          description: 'Analisis harga optimal berbasis AI'
        },
        {
          name: 'Chat Assistant',
          href: '/ai/chat',
          icon: MessageSquare,
          isSimple: true,
          badge: 'BETA',
          description: 'Chatbot bisnis dengan AI'
        },
        {
          name: 'Business Tips',
          href: '/ai/insights',
          icon: Lightbulb,
          isSimple: true,
          badge: 'NEW',
          description: 'Tips bisnis personal dari AI'
        }
      ]
    },
    {
      title: "Others",
      items: [
        {
          name: "Settings",
          href: '/settings',
          icon: Settings,
          description: "Pengaturan aplikasi dan preferences"
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
