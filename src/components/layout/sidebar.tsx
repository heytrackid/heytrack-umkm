'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ChefHat,
  Users,
  Factory,
  Calculator,
  Bot,
  Wand2,
  Settings,
  X,
  Menu
} from 'lucide-react'

interface SidebarItem {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const NAV_SECTIONS: SidebarSection[] = [
  {
    title: 'Utama',
    items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard }]
  },
  {
    title: 'Data Master',
    items: [
      { label: 'Bahan Baku', href: '/ingredients', icon: Package },
      { label: 'Resep Produk', href: '/recipes', icon: ChefHat },
      { label: 'Pelanggan', href: '/customers', icon: Users }
    ]
  },
  {
    title: 'Operasional',
    items: [
      { label: 'Pesanan', href: '/orders', icon: ShoppingCart },
      { label: 'Produksi', href: '/production', icon: Factory },
      { label: 'HPP & Pricing', href: '/hpp', icon: Calculator }
    ]
  },
  {
    title: 'Asisten & Otomasi',
    items: [
      { label: 'AI Assistant', href: '/ai-chatbot', icon: Bot },
      { label: 'Generator Resep', href: '/recipes/ai-generator', icon: Wand2 }
    ]
  },
  {
    title: 'Pengaturan',
    items: [{ label: 'Pengaturan', href: '/settings', icon: Settings }]
  }
]

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

const Sidebar = ({ isOpen = false, onToggle, isMobile = false }: SidebarProps) => {
  const pathname = usePathname()

  const sections = useMemo(() => NAV_SECTIONS, [])

  const content = (
    <nav className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">HeyTrack</p>
            <p className="font-semibold">Navigasi</p>
          </div>
          {!isMobile && onToggle && (
            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )

  if (isMobile) {
    return (
      <div className="h-full w-full bg-background">
        {content}
      </div>
    )
  }

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-background shadow-sm transition-transform duration-150 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {content}
      </aside>

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow lg:hidden',
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}

export default Sidebar
