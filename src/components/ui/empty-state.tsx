'use client'

import { Plus, Zap, Package, ShoppingCart, type LucideIcon } from '@/components/icons'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'



interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'default' | 'ghost' | 'outline'
  icon?: LucideIcon
}

interface EmptyStateTip {
  icon: string
  text: string
}

interface EmptyStateProps {
  icon?: LucideIcon
  emoji?: string
  title: string
  description: string
  actions?: EmptyStateAction[]
  tips?: EmptyStateTip[]
  className?: string
  compact?: boolean
}

export const EmptyState = ({
  icon: Icon,
  emoji,
  title,
  description,
  actions = [],
  tips = [],
  className,
  compact = false
}: EmptyStateProps) => (
  <Card className={cn('border-dashed', className)}>
    <CardContent className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'py-8' : 'py-12'
    )}>
      {/* Icon/Emoji */}
      <div className={cn(
        'rounded-full bg-muted flex items-center justify-center mb-4',
        compact ? 'w-16 h-16' : 'w-20 h-20'
      )}>
        {Icon && (
          <Icon className={cn(
            'text-muted-foreground',
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )} />
        )}
        {!Icon && emoji && (
          <span className={compact ? 'text-3xl' : 'text-4xl'}>{emoji}</span>
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-semibold text-foreground mb-2',
        compact ? 'text-lg' : 'text-xl'
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-muted-foreground mb-6 max-w-md',
        compact ? 'text-sm' : 'text-base'
      )}>
        {description}
      </p>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {actions.map((action, index) => {
            const ActionIcon = action.icon
            const button = (
              <Button
                key={index}
                variant={action.variant ?? (index === 0 ? 'default' : 'outline')}
                onClick={action.onClick}
                size={compact ? 'sm' : 'default'}
              >
                {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            )

            return action.href ? (
              <Link key={index} href={action.href}>
                {button}
              </Link>
            ) : button
          })}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && !compact && (
        <div className="w-full max-w-md space-y-2 mt-4 pt-4 border-t">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-left text-sm text-muted-foreground"
            >
              <span className="text-base flex-shrink-0">{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)

// Preset empty states for common scenarios
export const EmptyStatePresets = {
  orders: {
    emoji: '📦',
    title: 'Belum Ada Order',
    description: 'Mulai dengan membuat order pertama Anda. Order akan otomatis mengurangi stok bahan.',
    tips: [
      { icon: '💡', text: 'Order akan otomatis mengurangi stok bahan setelah dikonfirmasi' },
      { icon: '📊', text: 'Lihat laporan penjualan untuk analisis bisnis' },
      { icon: '🔔', text: 'Aktifkan notifikasi untuk update order real-time' }
    ]
  },
  recipes: {
    emoji: '👨‍🍳',
    title: 'Belum Ada Resep',
    description: 'Buat resep produk Anda untuk mulai menghitung HPP dan mengelola produksi.',
    tips: [
      { icon: '💡', text: 'Resep akan digunakan untuk menghitung HPP otomatis' },
      { icon: '🤖', text: 'Gunakan AI Generator untuk membuat resep lebih cepat' },
      { icon: '📋', text: 'Tambahkan biaya operasional untuk HPP yang akurat' }
    ]
  },
  ingredients: {
    emoji: '🥬',
    title: 'Belum Ada Bahan Baku',
    description: 'Tambahkan bahan baku untuk mulai mengelola inventory dan menghitung HPP produk Anda.',
    tips: [
      { icon: '💡', text: 'Stok akan otomatis berkurang saat order dikonfirmasi' },
      { icon: '🔔', text: 'Atur minimum stok untuk notifikasi reorder otomatis' },
      { icon: '💰', text: 'Harga bahan menggunakan WAC (Weighted Average Cost)' },
      { icon: '📥', text: 'Import CSV untuk menambahkan banyak bahan sekaligus' }
    ]
  },
  customers: {
    emoji: '👥',
    title: 'Belum Ada Customer',
    description: 'Tambahkan data customer untuk tracking order dan analisis penjualan.',
    tips: [
      { icon: '💡', text: 'Customer data membantu analisis repeat order' },
      { icon: '📱', text: 'Simpan nomor WhatsApp untuk notifikasi otomatis' },
      { icon: '📊', text: 'Lihat history pembelian per customer' }
    ]
  },
  production: {
    emoji: '⚙️',
    title: 'Belum Ada Produksi',
    description: 'Mulai batch produksi untuk tracking proses dan efisiensi produksi.',
    tips: [
      { icon: '💡', text: 'Batch produksi membantu tracking waste dan efisiensi' },
      { icon: '📊', text: 'Analisis waktu produksi untuk optimasi' },
      { icon: '🔔', text: 'Notifikasi otomatis saat produksi selesai' }
    ]
  },
  reports: {
    emoji: '📊',
    title: 'Belum Ada Data',
    description: 'Data laporan akan muncul setelah Anda memiliki transaksi.',
    tips: [
      { icon: '💡', text: 'Buat order untuk mulai melihat laporan' },
      { icon: '📈', text: 'Laporan diupdate real-time setiap ada transaksi' },
      { icon: '📅', text: 'Filter berdasarkan tanggal untuk analisis periode' }
    ]
  },
  hpp: {
    emoji: '🧮',
    title: 'Belum Ada Perhitungan HPP',
    description: 'Buat resep dan tambahkan bahan untuk mulai menghitung HPP produk Anda.',
    tips: [
      { icon: '💡', text: 'HPP dihitung otomatis dari harga bahan + biaya operasional' },
      { icon: '📊', text: 'Gunakan HPP untuk menentukan harga jual yang profitable' },
      { icon: '🔔', text: 'Notifikasi otomatis jika HPP naik signifikan' }
    ]
  },
  operationalCosts: {
    emoji: '💰',
    title: 'Belum Ada Biaya Operasional',
    description: 'Tambahkan biaya operasional untuk perhitungan HPP yang lebih akurat.',
    tips: [
      { icon: '💡', text: 'Setup Cepat menambahkan 8 template biaya umum' },
      { icon: '📊', text: 'Biaya operasional digunakan untuk menghitung HPP' },
      { icon: '🔔', text: 'Atur biaya berulang untuk tracking otomatis' }
    ],
    actions: [
      {
        label: 'Setup Cepat (8 Template)',
        variant: 'default' as const,
        icon: Zap
      },
      {
        label: 'Tambah Manual',
        variant: 'outline' as const,
        icon: Plus
      }
    ]
  },
  search: {
    emoji: '🔍',
    title: 'Tidak Ada Hasil',
    description: 'Coba gunakan kata kunci yang berbeda atau filter lain.',
    tips: [
      { icon: '💡', text: 'Gunakan kata kunci yang lebih umum' },
      { icon: '🔤', text: 'Periksa ejaan kata kunci' },
      { icon: '🔧', text: 'Hapus beberapa filter untuk hasil lebih luas' }
    ]
  },
  dashboard: {
    emoji: '🚀',
    title: 'Selamat Datang di HeyTrack!',
    description: 'Mari mulai mengelola bisnis kuliner Anda dengan mudah dan efisien.',
    actions: [
      {
        label: 'Buat Pesanan Pertama',
        href: '/orders/new',
        icon: ShoppingCart
      },
      {
        label: 'Tambah Bahan Baku',
        href: '/ingredients/new',
        icon: Package
      },
      {
        label: 'Setup Cepat',
        href: '/operational-costs',
        variant: 'outline' as const,
        icon: Zap
      }
    ],
    tips: [
      { icon: '📦', text: 'Mulai dengan menambah bahan baku' },
      { icon: '👨‍🍳', text: 'Buat resep untuk menghitung HPP' },
      { icon: '🛒', text: 'Terima pesanan pertama Anda' }
    ]
  },
  financial: {
    emoji: '💰',
    title: 'Belum Ada Transaksi',
    description: 'Mulai tracking arus kas dengan menambahkan transaksi pemasukan dan pengeluaran.',
    actions: [
      {
        label: 'Tambah Transaksi',
        onClick: () => {}, // Will be overridden in usage
        icon: Plus
      }
    ],
    tips: [
      { icon: '💡', text: 'Track semua pemasukan dan pengeluaran' },
      { icon: '📊', text: 'Lihat trend arus kas bulanan' },
      { icon: '📈', text: 'Analisis profitabilitas bisnis' }
    ]
  }
}
