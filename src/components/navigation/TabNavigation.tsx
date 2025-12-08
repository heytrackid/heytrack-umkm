'use client'

import {
    Bot,
    ChefHat,
    ChevronDown,
    Factory,
    FileText,
    Home,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Truck,
    Users,
    Wallet
} from '@/components/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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
        title: 'Pesanan',
        url: '/orders',
        icon: ShoppingCart
      },
      {
        title: 'Pelanggan',
        url: '/customers',
        icon: Users
      }
    ]
  },
  {
    label: 'Super Agent',
    items: [
      {
        title: 'Super Agent',
        url: '/super-agent',
        icon: Sparkles
      },
      {
        title: 'AI Chatbot',
        url: '/ai-chatbot',
        icon: Bot
      },
      {
        title: 'AI Recipe Generator',
        url: '/recipes/ai-generator',
        icon: ChefHat
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
        icon: ChefHat
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

// Add settings items to the navigation groups to reduce duplication
const settingsItems = [
  {
    title: 'Umum',
    url: '/settings',
    icon: Settings
  },

]

export function TabNavigation() {
  const pathname = usePathname()

  // State for controlling dropdown open/close on hover
  const [utamaOpen, setUtamaOpen] = useState(false)
  const [superAgentOpen, setSuperAgentOpen] = useState(false)
  const [hitungHppOpen, setHitungHppOpen] = useState(false)
  const [produksiOpen, setProduksiOpen] = useState(false)
  const [pengadaanOpen, setPengadaanOpen] = useState(false)
  const [keuanganOpen, setKeuanganOpen] = useState(false)
  const [laporanOpen, setLaporanOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Refs for close timeouts to allow moving from trigger to content
  const utamaTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const superAgentTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hitungHppTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const produksiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pengadaanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const keuanganTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const laporanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check if a path is active
  const checkIsActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === url
    }
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const baseTabClasses =
    "group/tab relative h-9 px-4 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  const underlineClasses =
    "after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-3/4 after:-translate-x-1/2 after:rounded-full after:bg-primary after:opacity-0 after:scale-x-50 after:transition-[transform,opacity] after:duration-200 after:ease-out group-hover/tab:after:opacity-100 group-hover/tab:after:scale-x-100"

  // Function to check if a group has any active items
  const hasActiveItem = (items: { url: string }[]) => {
    return items.some(item => checkIsActive(item.url))
  }

  return (
    <nav className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
          {navigationGroups.map((group) => {
            const groupHasActiveItem = hasActiveItem(group.items)

            const getOpenState = () => {
              switch (group.label) {
                case 'Utama': return utamaOpen
                case 'Super Agent': return superAgentOpen
                case 'Hitung HPP': return hitungHppOpen
                case 'Produksi': return produksiOpen
                case 'Pengadaan': return pengadaanOpen
                case 'Keuangan': return keuanganOpen
                case 'Laporan': return laporanOpen
                default: return false
              }
            }

            const getSetOpenState = () => {
              switch (group.label) {
                case 'Utama': return setUtamaOpen
                case 'Super Agent': return setSuperAgentOpen
                case 'Hitung HPP': return setHitungHppOpen
                case 'Produksi': return setProduksiOpen
                case 'Pengadaan': return setPengadaanOpen
                case 'Keuangan': return setKeuanganOpen
                case 'Laporan': return setLaporanOpen
                default: return () => {}
              }
            }

            const getTimeoutRef = () => {
              switch (group.label) {
                case 'Utama': return utamaTimeoutRef
                case 'Super Agent': return superAgentTimeoutRef
                case 'Hitung HPP': return hitungHppTimeoutRef
                case 'Produksi': return produksiTimeoutRef
                case 'Pengadaan': return pengadaanTimeoutRef
                case 'Keuangan': return keuanganTimeoutRef
                case 'Laporan': return laporanTimeoutRef
                default: return { current: null }
              }
            }

            return (
              <DropdownMenu key={group.label} open={getOpenState()} onOpenChange={getSetOpenState()}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onMouseEnter={() => {
                      const ref = getTimeoutRef()
                      if (ref.current) clearTimeout(ref.current)
                      getSetOpenState()(true)
                    }}
                    onMouseLeave={() => {
                      const ref = getTimeoutRef()
                      ref.current = setTimeout(() => getSetOpenState()(false), 100)
                    }}
                    className={cn(
                      baseTabClasses,
                      underlineClasses,
                      groupHasActiveItem
                        ? [
                            "text-primary bg-primary/10 shadow-sm",
                            "after:opacity-100 after:scale-x-100",
                            "hover:text-primary",
                          ]
                        : [
                            "text-muted-foreground",
                            "hover:text-foreground",
                            "hover:bg-accent/60",
                          ]
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[200px] p-1"
                  sideOffset={8}
                  onMouseEnter={() => {
                    const ref = getTimeoutRef()
                    if (ref.current) clearTimeout(ref.current)
                  }}
                  onMouseLeave={() => {
                    const ref = getTimeoutRef()
                    ref.current = setTimeout(() => getSetOpenState()(false), 100)
                  }}
                >
                  {group.items.map((item) => {
                    const itemIsActive = checkIsActive(item.url)

                    return (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "group/item flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            itemIsActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 transition-colors duration-150",
                            itemIsActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover/item:text-accent-foreground"
                          )} />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}

          {/* Settings Group - now using the same pattern as other groups */}
          <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onMouseEnter={() => {
                  if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current)
                  setSettingsOpen(true)
                }}
                onMouseLeave={() => {
                  settingsTimeoutRef.current = setTimeout(() => setSettingsOpen(false), 100)
                }}
                className={cn(
                  baseTabClasses,
                  underlineClasses,
                  pathname === '/settings' || pathname.startsWith('/settings/')
                    ? [
                        "text-primary bg-primary/10 shadow-sm",
                        "after:opacity-100 after:scale-x-100",
                        "hover:text-primary",
                      ]
                    : [
                        "text-muted-foreground",
                        "hover:text-foreground",
                        "hover:bg-accent/60",
                      ]
                )}
              >
                <span>Pengaturan</span>
                <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[200px] p-1"
              sideOffset={8}
              onMouseEnter={() => {
                if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current)
              }}
              onMouseLeave={() => {
                settingsTimeoutRef.current = setTimeout(() => setSettingsOpen(false), 100)
              }}
            >
              {settingsItems.map((item) => {
                const itemIsActive = checkIsActive(item.url)
                
                return (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "group/item flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        itemIsActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors duration-150",
                        itemIsActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover/item:text-accent-foreground"
                      )} />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}