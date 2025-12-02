'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Checklist item definition
export interface ChecklistItem {
  id: string
  title: string
  description: string
  href: string
  phase: 1 | 2 | 3
  checkFn: string // API endpoint to check completion
  icon: string
}

// Checklist items configuration
export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Phase 1: Setup Dasar
  {
    id: 'business_profile',
    title: 'Lengkapi Profil Bisnis',
    description: 'Isi nama bisnis, alamat, dan informasi dasar',
    href: '/settings',
    phase: 1,
    checkFn: 'business_profile',
    icon: 'Building2',
  },
  {
    id: 'first_ingredients',
    title: 'Tambah 5 Bahan Baku',
    description: 'Tambahkan minimal 5 bahan baku pertama',
    href: '/ingredients',
    phase: 1,
    checkFn: 'ingredients_count',
    icon: 'Package',
  },
  {
    id: 'first_recipe',
    title: 'Buat Resep Pertama',
    description: 'Buat minimal 1 resep produk',
    href: '/recipes/new',
    phase: 1,
    checkFn: 'recipes_count',
    icon: 'ChefHat',
  },
  {
    id: 'first_customer',
    title: 'Tambah Customer Pertama',
    description: 'Tambahkan minimal 1 customer',
    href: '/customers',
    phase: 1,
    checkFn: 'customers_count',
    icon: 'Users',
  },
  // Phase 2: Operasional
  {
    id: 'first_order',
    title: 'Buat Pesanan Pertama',
    description: 'Catat pesanan pertama dari customer',
    href: '/orders/new',
    phase: 2,
    checkFn: 'orders_count',
    icon: 'ShoppingCart',
  },
  {
    id: 'first_purchase',
    title: 'Catat Pembelian Bahan',
    description: 'Catat pembelian bahan baku dari supplier',
    href: '/ingredients/purchases',
    phase: 2,
    checkFn: 'purchases_count',
    icon: 'Receipt',
  },
  {
    id: 'calculate_hpp',
    title: 'Hitung HPP Resep',
    description: 'Hitung HPP untuk minimal 1 resep',
    href: '/hpp/calculator',
    phase: 2,
    checkFn: 'hpp_count',
    icon: 'Calculator',
  },
  {
    id: 'whatsapp_template',
    title: 'Setup WhatsApp Template',
    description: 'Buat template pesan WhatsApp',
    href: '/orders/whatsapp-templates',
    phase: 2,
    checkFn: 'templates_count',
    icon: 'MessageCircle',
  },
  // Phase 3: Advanced
  {
    id: 'first_production',
    title: 'Buat Batch Produksi',
    description: 'Catat batch produksi pertama',
    href: '/production',
    phase: 3,
    checkFn: 'production_count',
    icon: 'Factory',
  },
  {
    id: 'first_transaction',
    title: 'Catat Transaksi Keuangan',
    description: 'Catat income atau expense',
    href: '/cash-flow',
    phase: 3,
    checkFn: 'transactions_count',
    icon: 'Wallet',
  },
  {
    id: 'view_report',
    title: 'Lihat Laporan Profit',
    description: 'Akses halaman laporan profit',
    href: '/reports',
    phase: 3,
    checkFn: 'report_viewed',
    icon: 'BarChart3',
  },
  {
    id: 'first_supplier',
    title: 'Tambah Supplier',
    description: 'Tambahkan minimal 1 supplier',
    href: '/suppliers',
    phase: 3,
    checkFn: 'suppliers_count',
    icon: 'Truck',
  },
]

export interface ChecklistProgress {
  completedItems: string[]
  skippedItems: string[]
  dismissed: boolean
  lastUpdated: string
}

interface OnboardingData {
  id: string
  user_id: string
  current_step: number | null
  steps_data: ChecklistProgress | null
  completed: boolean | null
  created_at: string | null
  updated_at: string | null
}

// Fetch checklist progress
async function fetchChecklistProgress(): Promise<{
  onboarding: OnboardingData | null
  actualProgress: Record<string, boolean>
}> {
  const response = await fetch('/api/onboarding/checklist')
  if (!response.ok) {
    throw new Error('Failed to fetch checklist progress')
  }
  return response.json().then((res) => res.data)
}

// Update checklist progress
async function updateChecklistProgress(data: Partial<ChecklistProgress>): Promise<OnboardingData> {
  const response = await fetch('/api/onboarding/checklist', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update checklist progress')
  }
  return response.json().then((res) => res.data)
}

export function useOnboardingChecklist() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['onboarding-checklist'],
    queryFn: fetchChecklistProgress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  const updateMutation = useMutation({
    mutationFn: updateChecklistProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklist'] })
    },
  })

  // Parse steps_data safely
  let stepsData: ChecklistProgress = {
    completedItems: [],
    skippedItems: [],
    dismissed: false,
    lastUpdated: new Date().toISOString(),
  }

  if (data?.onboarding?.steps_data) {
    const parsed = data.onboarding.steps_data as Partial<ChecklistProgress>
    stepsData = {
      completedItems: parsed.completedItems ?? [],
      skippedItems: parsed.skippedItems ?? [],
      dismissed: parsed.dismissed ?? false,
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    }
  }

  const progress = stepsData
  const actualProgress = data?.actualProgress ?? {}

  // Merge manual completions with actual data checks
  const getItemStatus = (itemId: string): 'completed' | 'skipped' | 'pending' => {
    if (progress.completedItems.includes(itemId) || actualProgress[itemId]) {
      return 'completed'
    }
    if (progress.skippedItems.includes(itemId)) {
      return 'skipped'
    }
    return 'pending'
  }

  const completedCount = CHECKLIST_ITEMS.filter(
    (item) => getItemStatus(item.id) === 'completed'
  ).length

  const totalCount = CHECKLIST_ITEMS.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const markAsCompleted = (itemId: string) => {
    const newCompleted = [...new Set([...progress.completedItems, itemId])]
    updateMutation.mutate({
      completedItems: newCompleted,
      lastUpdated: new Date().toISOString(),
    })
  }

  const markAsSkipped = (itemId: string) => {
    const newSkipped = [...new Set([...progress.skippedItems, itemId])]
    updateMutation.mutate({
      skippedItems: newSkipped,
      lastUpdated: new Date().toISOString(),
    })
  }

  const dismissChecklist = () => {
    updateMutation.mutate({
      dismissed: true,
      lastUpdated: new Date().toISOString(),
    })
  }

  const resetChecklist = () => {
    updateMutation.mutate({
      completedItems: [],
      skippedItems: [],
      dismissed: false,
      lastUpdated: new Date().toISOString(),
    })
  }

  return {
    items: CHECKLIST_ITEMS,
    progress,
    actualProgress,
    getItemStatus,
    completedCount,
    totalCount,
    progressPercent,
    isDismissed: progress.dismissed,
    isLoading,
    error,
    markAsCompleted,
    markAsSkipped,
    dismissChecklist,
    resetChecklist,
    isUpdating: updateMutation.isPending,
  }
}
