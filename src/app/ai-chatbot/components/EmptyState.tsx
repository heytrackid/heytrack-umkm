'use client'

import { Bot, ChefHat, Package, TrendingUp, Wallet } from '@/components/icons'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Kondisi Bisnis',
    prompt: 'Bagaimana kondisi bisnis saya hari ini?',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    icon: Package,
    label: 'Cek Stok',
    prompt: 'Bahan baku apa yang stoknya kritis?',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
  },
  {
    icon: ChefHat,
    label: 'Resep Populer',
    prompt: 'Resep mana yang paling laris bulan ini?',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
  },
  {
    icon: Wallet,
    label: 'Analisis Profit',
    prompt: 'Bagaimana profit margin saya bulan ini?',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
]

export const EmptyState = ({ onSuggestionClick }: EmptyStateProps): JSX.Element => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo & Welcome */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 ring-1 ring-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Halo! Saya HeyTrack AI 👋
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Asisten cerdas untuk bisnis kuliner Anda. Tanyakan tentang stok, pesanan, resep, atau analisis bisnis.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="w-full max-w-lg">
        <p className="text-xs text-muted-foreground text-center mb-4">
          Mulai dengan salah satu pertanyaan ini:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_PROMPTS.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`h-auto py-4 px-4 flex flex-col items-center gap-2 rounded-xl border border-border/50 ${item.bgColor} transition-all`}
              onClick={() => onSuggestionClick(item.prompt)}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
