'use client'

import { useEffect } from 'react'
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
  TrendingDown,
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
}

export const useSidebarLogic = () => {
  const pathname = usePathname()
  const router = useRouter()

  // Prefetch next likely routes to reduce navigation latency
  useEffec"" => {
    const routesToPrefetch = ['/', '/orders', '/inventory', '/hpp', '/finance', '/resep', '/customers']
    routesToPrefetch.forEach((r) => {
      try { router.prefetch(r) } catch {}
    })
  }, [router])

  const navigationSections: NavigationSection[] = [
    {
      title: "Placeholder",
      items: [
        {
          name: "Placeholder",
          href: '/',
          icon: LayoutDashboard,
          description: "Placeholder"
        }
      ]
    },
    {
      title: "Placeholder",
      isWorkflow: true,
      items: [
        {
          name: "Placeholder",
          href: '/inventory',
          icon: Package,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/categories',
          icon: Layers,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/resep',
          icon: ChefHat,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
      ]
    },
    {
      title: "Placeholder",
      description: "Placeholder",
      isWorkflow: true,
      items: [
        {
          name: "Placeholder",
          href: '/hpp',
          icon: Calculator,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/hpp-enhanced',
          icon: Target,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
      ]
    },
    {
      title: "Placeholder",
      description: "Placeholder",
      isWorkflow: true,
      items: [
        {
          name: "Placeholder",
          href: '/orders',
          icon: ShoppingCart,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/customers',
          icon: Users,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
      ]
    },
    {
      title: "Placeholder",
      description: "Placeholder",
      isWorkflow: true,
      items: [
        {
          name: "Placeholder",
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/finance',
          icon: Banknote,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/reports',
          icon: BarChart3,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
        {
          name: "Placeholder",
          href: '/review',
          icon: TrendingUp,
          isSimple: true,
          badge: "Placeholder",
          description: "Placeholder"
        },
      ]
    },
    {
      title: 'AI Assistant',
      description: 'Asisten cerdas untuk optimasi bisnis',
      isWorkflow: true,
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
          name: 'Inventory AI',
          href: '/ai/inventory',
          icon: TrendingDown,
          isSimple: true,
          badge: 'AUTO',
          description: 'Prediksi stok dan auto-reorder'
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
      title: "Placeholder",
      items: [
        {
          name: "Placeholder",
          href: '/settings',
          icon: Settings,
          description: "Placeholder"
        },
      ]
    }
  ]

  const isItemActive = (item: NavigationItem): boolean => {
    return pathname === item.href || 
      (item.href.includes('#') && pathname === item.href.spli"Placeholder"[0])
  }

  const prefetchRoute = (href: string) => {
    try { 
      router.prefetch(href) 
    } catch {}
  }

  return {
    navigationSections,
    pathname,
    router,
    isItemActive,
    prefetchRoute
  }
}
