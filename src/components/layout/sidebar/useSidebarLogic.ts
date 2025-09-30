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
import { useI18n } from '@/providers/I18nProvider'

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
  const { t } = useI18n()

  // Prefetch next likely routes to reduce navigation latency
  useEffect(() => {
    const routesToPrefetch = ['/', '/orders', '/inventory', '/hpp', '/finance', '/resep', '/customers']
    routesToPrefetch.forEach((r) => {
      try { router.prefetch(r) } catch {}
    })
  }, [router])

  const navigationSections: NavigationSection[] = [
    {
      title: t('navigation.dashboard.title'),
      items: [
        {
          name: t('navigation.dashboard.title'),
          href: '/',
          icon: LayoutDashboard,
          description: t('navigation.dashboard.description')
        }
      ]
    },
    {
      title: t('navigation.dataManager.title'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.dataManager.rawMaterials.title'),
          href: '/inventory',
          icon: Package,
          isSimple: true,
          badge: t('navigation.dataManager.rawMaterials.badge'),
          description: t('navigation.dataManager.rawMaterials.description')
        },
        {
          name: t('navigation.dataManager.categories.title'),
          href: '/categories',
          icon: Layers,
          isSimple: true,
          badge: t('navigation.dataManager.categories.badge'),
          description: t('navigation.dataManager.categories.description')
        },
        {
          name: t('navigation.dataManager.operationalCosts.title'),
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          badge: t('navigation.dataManager.operationalCosts.badge'),
          description: t('navigation.dataManager.operationalCosts.description')
        },
        {
          name: t('navigation.dataManager.recipes.title'),
          href: '/resep',
          icon: ChefHat,
          isSimple: true,
          badge: t('navigation.dataManager.recipes.badge'),
          description: t('navigation.dataManager.recipes.description')
        },
      ]
    },
    {
      title: t('navigation.calculation.title'),
      description: t('navigation.calculation.description'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.calculation.hppPricing.title'),
          href: '/hpp',
          icon: Calculator,
          isSimple: true,
          badge: t('navigation.calculation.hppPricing.badge'),
          description: t('navigation.calculation.hppPricing.description')
        },
        {
          name: t('navigation.calculation.hppEnhanced.title'),
          href: '/hpp-enhanced',
          icon: Target,
          isSimple: true,
          badge: t('navigation.calculation.hppEnhanced.badge'),
          description: t('navigation.calculation.hppEnhanced.description')
        },
      ]
    },
    {
      title: t('navigation.operations.title'),
      description: t('navigation.operations.description'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.operations.orders.title'),
          href: '/orders',
          icon: ShoppingCart,
          isSimple: true,
          badge: t('navigation.operations.orders.badge'),
          description: t('navigation.operations.orders.description')
        },
        {
          name: t('navigation.operations.customers.title'),
          href: '/customers',
          icon: Users,
          isSimple: true,
          badge: t('navigation.operations.customers.badge'),
          description: t('navigation.operations.customers.description')
        },
      ]
    },
    {
      title: t('navigation.monitoring.title'),
      description: t('navigation.monitoring.description'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.monitoring.cashFlow.title'),
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          badge: t('navigation.monitoring.cashFlow.badge'),
          description: t('navigation.monitoring.cashFlow.description')
        },
        {
          name: t('navigation.monitoring.finance.title'),
          href: '/finance',
          icon: Banknote,
          isSimple: true,
          badge: t('navigation.monitoring.finance.badge'),
          description: t('navigation.monitoring.finance.description')
        },
        {
          name: t('navigation.monitoring.reports.title'),
          href: '/reports',
          icon: BarChart3,
          isSimple: true,
          badge: t('navigation.monitoring.reports.badge'),
          description: t('navigation.monitoring.reports.description')
        },
        {
          name: t('navigation.monitoring.review.title'),
          href: '/review',
          icon: TrendingUp,
          isSimple: true,
          badge: t('navigation.monitoring.review.badge'),
          description: t('navigation.monitoring.review.description')
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
      title: t('navigation.others.title'),
      items: [
        {
          name: t('navigation.others.settings.title'),
          href: '/settings',
          icon: Settings,
          description: t('navigation.others.settings.description')
        },
      ]
    }
  ]

  const isItemActive = (item: NavigationItem): boolean => {
    return pathname === item.href || 
      (item.href.includes('#') && pathname === item.href.split('#')[0])
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
