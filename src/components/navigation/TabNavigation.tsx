'use client'

import {
    Bot,
    Box,
    ChefHat,
    ChevronDown,
    DollarSign,
    FileText,
    Home,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Store,
    TrendingUp,
    Truck,
    Users,
    Wallet
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        icon: Users
      }
    ]
  },
  {
    label: 'Produksi',
    items: [
      {
        title: 'Resep',
        url: '/recipes',
        icon: ChefHat
      },
      {
        title: 'Bahan Baku',
        url: '/ingredients',
        icon: Package
      },
      {
        title: 'Produksi',
        url: '/production',
        icon: Box
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
      },
      {
        title: 'Pembelian',
        url: '/ingredients/purchases',
        icon: Store
      }
    ]
  },
  {
    label: 'Keuangan',
    items: [
      {
        title: 'HPP Calculator',
        url: '/hpp',
        icon: DollarSign
      },
      {
        title: 'Arus Kas',
        url: '/cash-flow',
        icon: Wallet
      },
       {
         title: 'Laba',
         url: '/profit',
         icon: TrendingUp
       },
       {
         title: 'Biaya Operasional',
         url: '/operational-costs',
         icon: Receipt
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

  // Function to check if a path is active
  const checkIsActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === url
    }
    return pathname === url || pathname.startsWith(`${url}/`)
  }

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

            return (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap relative group rounded-md",
                      // Base styles (inactive state)
                      !groupHasActiveItem && "text-muted-foreground",
                      // Active styles - when any item in the group is active
                      groupHasActiveItem && [
                        "bg-primary/10 text-primary",
                        // Active indicator line
                        "after:absolute after:bottom-0 after:left-1/2 after:opacity-100 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:-translate-x-1/2 after:content-['']",
                        "after:w-full"
                      ],
                      // Hover styles - apply to both active and inactive tabs
                      "hover:bg-accent/60",
                      // If group is active, hover maintains primary color; if not active, hover changes to foreground color
                      groupHasActiveItem ? "hover:text-primary" : "hover:text-accent-foreground"
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[200px] p-1"
                  sideOffset={8}
                >
                  {group.items.map((item) => {
                    const itemIsActive = checkIsActive(item.url)

                    return (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 cursor-pointer rounded-sm transition-colors",
                            // Active styles for the individual item, with improved hover state
                            itemIsActive ? 
                              "bg-primary/10 text-primary font-medium" : 
                              "hover:bg-accent/50"
                          )}
                        >
                          <item.icon className={cn(
                            "h-4 w-4",
                            itemIsActive ? "text-primary" : "text-muted-foreground"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap relative group rounded-md",
                  // Base styles (inactive state)
                  !(pathname === '/settings' || pathname.startsWith('/settings/')) && "text-muted-foreground",
                  // Apply active state if any settings page is active
                  (pathname === '/settings' || pathname.startsWith('/settings/')) && [
                    "bg-primary/10 text-primary",
                    // Active indicator line
                    "after:absolute after:bottom-0 after:left-1/2 after:opacity-100 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 after:-translate-x-1/2 after:content-['']",
                    "after:w-full"
                  ],
                  // Hover styles - apply to both active and inactive tabs
                  "hover:bg-accent/60",
                  // If group is active, hover maintains primary color; if not active, hover changes to foreground color
                  (pathname === '/settings' || pathname.startsWith('/settings/')) ? "hover:text-primary" : "hover:text-accent-foreground"
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
            >
              {settingsItems.map((item) => {
                const itemIsActive = checkIsActive(item.url)
                
                return (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 cursor-pointer rounded-sm transition-colors",
                        // Active styles for the individual item, with improved hover state
                        itemIsActive ? 
                          "bg-primary/10 text-primary font-medium" : 
                          "hover:bg-accent/50"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4",
                        itemIsActive ? "text-primary" : "text-muted-foreground"
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