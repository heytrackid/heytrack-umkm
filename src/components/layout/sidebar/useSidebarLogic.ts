'use client'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Calculator,
  ChefHat,
  DollarSign,
  Factory,
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
  Sparkles,
  BarChart3
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
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

  // Default collapsed state
  const defaultCollapsed = {
    'Kelola Data': false,
    'Perhitungan': false,
    'Operasional': false,
    'Monitoring': false,
    'Asisten AI': false,
    'Analytics & Laporan': false,
    'Pengaturan': false,
  }

  // Collapsible sections state - start with default, load from localStorage after mount
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(defaultCollapsed)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed-sections')
      if (saved) {
        setCollapsedSections(JSON.parse(saved))
      }
    } catch (error) {
      // Ignore localStorage errors
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage when state changes (debounced)
  useEffect(() => {
    if (!isHydrated) return // Don't save during initial hydration
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('sidebar-collapsed-sections', JSON.stringify(collapsedSections))
      } catch (error) {
        // Ignore localStorage errors
      }
    }, 100) // Debounce to avoid excessive writes

    return () => clearTimeout(timeoutId)
  }, [collapsedSections, isHydrated])

  // Prefetch next likely routes - staggered to avoid blocking
  useEffect(() => {
    // Only prefetch after component is mounted and idle
    const timeoutId = setTimeout(() => {
      const routesToPrefetch = [
        '/', '/orders', '/ingredients', '/recipes', '/customers', 
        '/cash-flow', '/profit', '/reports'
      ]
      
      // Stagger prefetch requests to avoid blocking
      routesToPrefetch.forEach((route, index) => {
        setTimeout(() => {
          try { 
            router.prefetch(route) 
          } catch (error) { 
            // Ignore prefetch errors
          }
        }, index * 50) // 50ms delay between each prefetch
      })
    }, 500) // Wait 500ms after mount before starting prefetch

    return () => clearTimeout(timeoutId)
  }, [router])

  // Memoize navigation sections to avoid recreating on every render
  const navigationSections: NavigationSection[] = useMemo(() => [
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
      title: "1️⃣ Setup Awal",
      description: "Langkah pertama: Siapkan data dasar",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "1. Bahan Baku",
          href: '/ingredients',
          icon: Package,
          isSimple: true,
          stepNumber: 1,
          description: "Input semua bahan baku dan harga"
        },
        {
          name: "2. Resep Produk",
          href: '/recipes',
          icon: ChefHat,
          isSimple: true,
          stepNumber: 2,
          description: "Buat resep dengan komposisi bahan"
        },
        {
          name: "3. Biaya & Harga",
          href: '/hpp',
          icon: Calculator,
          isSimple: true,
          stepNumber: 3,
          description: "Hitung biaya dan tentukan harga jual"
        },
      ]
    },
    {
      title: "2️⃣ Operasional Harian",
      description: "Jalankan bisnis sehari-hari",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "4. Pelanggan",
          href: '/customers',
          icon: Users,
          isSimple: true,
          stepNumber: 4,
          description: "Kelola data pelanggan"
        },
        {
          name: "5. Pesanan",
          href: '/orders',
          icon: ShoppingCart,
          isSimple: true,
          stepNumber: 5,
          description: "Terima dan kelola pesanan"
        },
        {
          name: "6. Produksi",
          href: '/production',
          icon: Factory,
          isSimple: true,
          stepNumber: 6,
          description: "Track batch produksi"
        },
        {
          name: "7. Biaya Operasional",
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          stepNumber: 7,
          description: "Catat biaya harian (listrik, gas, dll)"
        },
      ]
    },
    {
      title: "3️⃣ Monitoring & Laporan",
      description: "Pantau keuangan dan performa",
      isWorkflow: true,
      isCollapsible: true,
      items: [
        {
          name: "8. Arus Kas",
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          stepNumber: 7,
          description: "Lihat uang masuk dan keluar"
        },
        {
          name: "8. Laba Rugi",
          href: '/profit',
          icon: TrendingUp,
          isSimple: true,
          stepNumber: 8,
          description: "Analisis untung rugi bisnis"
        },
        {
          name: "9. Laporan Lengkap",
          href: '/reports',
          icon: FileText,
          isSimple: true,
          stepNumber: 9,
          description: "Semua laporan dan analytics"
        }
      ]
    },
    {
      title: "🤖 Asisten AI",
      description: "Bantuan cerdas untuk bisnis",
      isCollapsible: true,
      items: [
        {
          name: "Chat AI",
          href: '/ai-chatbot',
          icon: Bot,
          description: "Tanya apa saja tentang bisnis"
        },
        {
          name: "Generator Resep",
          href: '/recipes/ai-generator',
          icon: Sparkles,
          description: "Buat resep baru dengan AI"
        }
      ]
    },
    {
      title: "⚙️ Lainnya",
      description: "Pengaturan dan tools tambahan",
      isCollapsible: true,
      items: [
        {
          name: "Kategori",
          href: '/categories',
          icon: Layers,
          description: "Organisir produk dan bahan"
        },
        {
          name: "Pengaturan",
          href: '/settings',
          icon: Settings,
          description: "Konfigurasi aplikasi"
        }
      ]
    },
  ], []) // Empty deps - navigation structure is static

  // Memoize callbacks to prevent unnecessary re-renders
  const isItemActive = useCallback((item: NavigationItem): boolean => 
    pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0]),
    [pathname]
  )

  const prefetchRoute = useCallback((href: string) => {
    try {
      void router.prefetch(href)
    } catch (error) { 
      // Ignore prefetch errors
    }
  }, [router])

  const toggleSection = useCallback((sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }, [])

  const isSectionCollapsed = useCallback((sectionTitle: string): boolean => 
    collapsedSections[sectionTitle] || false,
    [collapsedSections]
  )

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
