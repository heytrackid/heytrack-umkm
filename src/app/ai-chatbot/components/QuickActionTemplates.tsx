'use client'

import {
    BarChart3,
    Calculator,
    ChefHat,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface QuickTemplate {
  id: string
  icon: React.ReactNode
  label: string
  prompt: string
  category: 'business' | 'inventory' | 'orders' | 'recipes' | 'financial'
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  // Business Overview
  {
    id: 'business-health',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Cek Kesehatan Bisnis',
    prompt: 'Bagaimana kondisi bisnis saya secara keseluruhan? Berikan analisis singkat tentang penjualan, stok, dan profit.',
    category: 'business',
  },
  {
    id: 'daily-summary',
    icon: <BarChart3 className="h-4 w-4" />,
    label: 'Ringkasan Hari Ini',
    prompt: 'Berikan ringkasan aktivitas bisnis hari ini: pesanan masuk, pendapatan, dan hal yang perlu diperhatikan.',
    category: 'business',
  },
  // Inventory
  {
    id: 'low-stock',
    icon: <Package className="h-4 w-4" />,
    label: 'Cek Stok Kritis',
    prompt: 'Bahan baku apa saja yang stoknya sudah kritis dan perlu segera dibeli?',
    category: 'inventory',
  },
  {
    id: 'restock-suggestion',
    icon: <ShoppingCart className="h-4 w-4" />,
    label: 'Saran Restock',
    prompt: 'Berdasarkan pola penjualan, bahan apa yang perlu saya restock minggu ini dan berapa jumlahnya?',
    category: 'inventory',
  },
  // Orders
  {
    id: 'pending-orders',
    icon: <ShoppingCart className="h-4 w-4" />,
    label: 'Pesanan Pending',
    prompt: 'Ada berapa pesanan yang masih pending? Mana yang paling urgent untuk diproses?',
    category: 'orders',
  },
  {
    id: 'top-customers',
    icon: <Users className="h-4 w-4" />,
    label: 'Pelanggan Terbaik',
    prompt: 'Siapa 5 pelanggan terbaik saya bulan ini berdasarkan total pembelian?',
    category: 'orders',
  },
  // Recipes
  {
    id: 'profitable-recipes',
    icon: <ChefHat className="h-4 w-4" />,
    label: 'Resep Paling Untung',
    prompt: 'Resep mana yang paling menguntungkan berdasarkan margin profit? Berikan top 5.',
    category: 'recipes',
  },
  {
    id: 'recipe-suggestion',
    icon: <ChefHat className="h-4 w-4" />,
    label: 'Saran Menu Baru',
    prompt: 'Berdasarkan bahan yang tersedia, menu baru apa yang bisa saya buat untuk meningkatkan penjualan?',
    category: 'recipes',
  },
  // Financial
  {
    id: 'profit-analysis',
    icon: <Wallet className="h-4 w-4" />,
    label: 'Analisis Profit',
    prompt: 'Bagaimana profit saya bulan ini dibanding bulan lalu? Apa yang bisa ditingkatkan?',
    category: 'financial',
  },
  {
    id: 'hpp-check',
    icon: <Calculator className="h-4 w-4" />,
    label: 'Cek HPP',
    prompt: 'Apakah ada resep yang HPP-nya sudah tidak akurat karena perubahan harga bahan?',
    category: 'financial',
  },
]

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  business: { label: '📊 Bisnis', color: 'text-blue-600' },
  inventory: { label: '📦 Inventori', color: 'text-orange-600' },
  orders: { label: '🛒 Pesanan', color: 'text-green-600' },
  recipes: { label: '👨‍🍳 Resep', color: 'text-purple-600' },
  financial: { label: '💰 Keuangan', color: 'text-pink-600' },
}

interface QuickActionTemplatesProps {
  onSelectTemplate: (prompt: string) => void
  disabled?: boolean
  className?: string
}

export function QuickActionTemplates({
  onSelectTemplate,
  disabled,
  className,
}: QuickActionTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Object.keys(CATEGORY_LABELS)
  
  const filteredTemplates = selectedCategory
    ? QUICK_TEMPLATES.filter((t) => t.category === selectedCategory)
    : QUICK_TEMPLATES.slice(0, 6) // Show first 6 by default

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
        >
          <span>⚡ Template Pertanyaan Cepat</span>
          <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pilih kategori atau langsung klik template
            </CardTitle>
            {/* Category filters */}
            <div className="flex flex-wrap gap-1 mt-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setSelectedCategory(null)}
              >
                Semua
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-6 text-xs px-2',
                    selectedCategory !== cat && CATEGORY_LABELS[cat]?.color
                  )}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]?.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {filteredTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3 justify-start text-left"
                  onClick={() => {
                    onSelectTemplate(template.prompt)
                    setIsOpen(false)
                  }}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-shrink-0">{template.icon}</span>
                    <span className="text-xs truncate">{template.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
