'use client'

import {
    Bot,
    ChevronDown,
    ChevronRight,
    Factory,
    FileText,
    Home,
    Menu,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    TrendingUp,
    Truck,
    User,
    Wallet
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const navigationGroups = [
  {
    label: 'Utama',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home
      },
      {
        title: 'AI Chatbot',
        url: '/ai-chatbot',
        icon: Bot
      },
      {
        title: 'Pesanan',
        url: '/orders',
        icon: ShoppingCart
      },
      {
        title: 'Pelanggan',
        url: '/customers',
        icon: User
      }
    ]
  },
  {
    label: 'Hitung HPP',
    items: [
      {
        title: 'Bahan Baku',
        url: '/ingredients',
        icon: Package
      },
      {
        title: 'Biaya Operasional',
        url: '/operational-costs',
        icon: Receipt
      },
      {
        title: 'Resep Produk',
        url: '/recipes',
        icon: FileText
      },
      {
        title: 'Kalkulator HPP',
        url: '/hpp/calculator',
        icon: TrendingUp
      }
    ]
  },
  {
    label: 'Produksi',
    items: [
      {
        title: 'Produksi',
        url: '/production',
        icon: Factory
      }
    ]
  },
  {
    label: 'Pengadaan',
    items: [
      {
        title: 'Supplier',
        url: '/suppliers',
        icon: Truck
      }
    ]
  },
  {
    label: 'Keuangan',
    items: [
      {
        title: 'Arus Kas',
        url: '/cash-flow',
        icon: Wallet
      },
      {
        title: 'Laba',
        url: '/profit',
        icon: TrendingUp
      }
    ]
  },
  {
    label: 'Laporan',
    items: [
      {
        title: 'Laporan',
        url: '/reports',
        icon: FileText
      }
    ]
  }
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Utama': true,
    'Hitung HPP': true,
    'Produksi': true,
    'Pengadaan': true,
    'Keuangan': true,
    'Laporan': true
  })

  // Toggle group collapse
  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const checkIsActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === url
    }
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1c1c1c] text-zinc-400">
      <div className="flex h-14 items-center border-b border-zinc-800 px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <span className="font-bold text-sm">HT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-100">HeyTrack</span>
            <span className="text-[10px] text-zinc-500">UMKM Management</span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full text-[11px] font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors px-3 py-2"
              >
                {group.label}
                {openGroups[group.label] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
              
              {openGroups[group.label] && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = checkIsActive(item.url)
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                          isActive 
                            ? "bg-emerald-500/10 text-emerald-500 font-medium" 
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-100")} />
                        {item.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-800 p-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
            pathname.startsWith('/settings')
              ? "bg-emerald-500/10 text-emerald-500" 
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          )}
        >
          <Settings className="h-4 w-4" />
          Pengaturan
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block w-64 border-r border-zinc-800 bg-[#1c1c1c] fixed inset-y-0 z-50", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-3 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
