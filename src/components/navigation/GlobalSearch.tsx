'use client'

import { type ComponentType, memo, useCallback, useEffect, useState } from 'react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useSupabaseCRUD } from '@/hooks/supabase/useSupabaseCRUD'
import { useDebounce } from '@/hooks/useDebounce'
import {
  BarChart3,
  BookOpen,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase-generated'

// Extended types for search display
type IngredientItem = Pick<Database['public']['Tables']['ingredients']['Row'], 'id' | 'name' | 'current_stock' | 'unit'>
type OrderItem = Pick<Database['public']['Tables']['orders']['Row'], 'id' | 'order_no' | 'customer_name'>
type CustomerItem = Pick<Database['public']['Tables']['customers']['Row'], 'id' | 'name' | 'email' | 'phone'>
type RecipeItem = Pick<Database['public']['Tables']['recipes']['Row'], 'id' | 'name'>

interface QuickAction {
  label: string
  icon: ComponentType<{ className?: string }>
  action: () => void
}

export const GlobalSearch = memo(() => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const router = useRouter()

  // Fetch data for search
  const { data: ingredients } = useSupabaseCRUD('ingredients')
  const { data: orders } = useSupabaseCRUD('orders')
  const { data: customers } = useSupabaseCRUD('customers')
  const { data: recipes } = useSupabaseCRUD('recipes')

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open: boolean) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Filter results based on debounced search
  const filteredIngredients = (ingredients as IngredientItem[] | undefined)?.filter((item: IngredientItem) =>
    item.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).slice(0, 5) || []

  const filteredOrders = (orders as OrderItem[] | undefined)?.filter((item: OrderItem) =>
    item.order_no?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).slice(0, 5) || []

  const filteredCustomers = (customers as CustomerItem[] | undefined)?.filter((item: CustomerItem) =>
    item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.phone?.includes(debouncedSearch)
  ).slice(0, 5) || []

  const filteredRecipes = (recipes as RecipeItem[] | undefined)?.filter((item: RecipeItem) =>
    item.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).slice(0, 5) || []

  // Quick actions
  const quickActions: QuickAction[] = [
    { label: 'Buat Pesanan Baru', icon: ShoppingCart, action: () => router.push('/orders') }, // Opens orders page with dialog
    { label: 'Tambah Bahan Baku', icon: Package, action: () => router.push('/ingredients') }, // Opens ingredients page with dialog
    { label: 'Tambah Pelanggan', icon: Users, action: () => router.push('/customers/new') },
    { label: 'Buat Resep Baru', icon: BookOpen, action: () => router.push('/recipes') },
    { label: 'Lihat Laporan', icon: BarChart3, action: () => router.push('/reports') },
    { label: 'Pengaturan', icon: Settings, action: () => router.push('/settings') },
  ]

  const handleSelect = useCallback((callback: () => void) => {
    void setOpen(false)
    callback()
  }, [])

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-muted/50 transition-colors w-full md:w-64"
      >
        <Search className="h-4 w-4" />
        <span>Cari...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Cari pesanan, pelanggan, bahan baku..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

          {/* Quick Actions */}
          {!debouncedSearch && (
            <CommandGroup heading="Aksi Cepat">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.label}
                  onSelect={() => handleSelect(action.action)}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Ingredients */}
          {filteredIngredients.length > 0 && (
            <CommandGroup heading="Bahan Baku">
              {filteredIngredients.map((item: IngredientItem) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(() => router.push(`/ingredients/${item.id}`))}
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.current_stock} {item.unit}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Orders */}
          {filteredOrders.length > 0 && (
            <CommandGroup heading="Pesanan">
              {filteredOrders.map((item: OrderItem) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(() => router.push(`/orders/${item.id}`))}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>{item.order_no}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.customer_name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <CommandGroup heading="Pelanggan">
              {filteredCustomers.map((item: CustomerItem) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(() => router.push(`/customers/${item.id}`))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  {item.phone && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.phone}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recipes */}
          {filteredRecipes.length > 0 && (
            <CommandGroup heading="Resep">
              {filteredRecipes.map((item: RecipeItem) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(() => router.push(`/recipes`))}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
})