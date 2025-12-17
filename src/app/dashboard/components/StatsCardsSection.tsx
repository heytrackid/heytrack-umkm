'use client'

import { AlertCircle, DollarSign, HelpCircle, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from '@/components/icons'

import { Card, CardContent } from '@/components/ui/card'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StatsCardsSectionProps {
  stats?: {
    revenue: {
      total: number
      growth: string
      trend: 'down' | 'up'
    }
    orders: {
      total: number
      active: number
    }
    customers: {
      total: number
      vip: number
    }
    inventory: {
      total: number
      lowStock: number
    }
  }
  formatCurrency: (value: number) => string
}

const StatsCardsSection = ({ stats, formatCurrency }: StatsCardsSectionProps): JSX.Element => {
   if (!stats) {
     return (
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {Array.from({ length: 4 }).map((_, i) => (
           <Card key={i} className="overflow-hidden border-border/50">
             <CardContent className="p-6">
               <div className="flex flex-col space-y-4">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                   <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                   <div className="h-10 w-10 bg-muted animate-pulse rounded-xl" />
                 </div>
                 <div className="space-y-2">
                   <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                   <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
     )
   }

   const cards: StatCardData[] = [
     {
       title: (
         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
           <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
             Total Penjualan
           </span>
           <Tooltip>
             <TooltipTrigger>
               <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
             </TooltipTrigger>
             <TooltipContent>
               <p>Total pendapatan dari semua pesanan yang telah selesai</p>
             </TooltipContent>
           </Tooltip>
         </div>
       ),
       value: formatCurrency(stats.revenue.total),
       valueClassName: 'text-2xl sm:text-3xl tracking-tight break-words text-foreground',
       icon: DollarSign,
       cardClassName: 'group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-emerald-500/20',
       iconWrapperClassName: 'p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300',
       iconClassName: 'h-5 w-5 text-emerald-600 dark:text-emerald-400',
       footer: (
         <div className={cn(
           'flex items-center text-xs font-medium px-2 py-1 rounded-full w-fit',
           stats.revenue.trend === 'up'
             ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
             : 'bg-rose-100/50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
         )}>
           {stats.revenue.trend === 'up' ? (
             <TrendingUp className="h-3 w-3 mr-1.5" />
           ) : (
             <TrendingDown className="h-3 w-3 mr-1.5" />
           )}
           <span className="truncate">{stats.revenue.growth}% dari kemarin</span>
         </div>
       )
     },
     {
       title: (
         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
           <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
             Total Pesanan
           </span>
           <Tooltip>
             <TooltipTrigger>
               <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
             </TooltipTrigger>
             <TooltipContent>
               <p>Jumlah total pesanan yang telah dibuat</p>
             </TooltipContent>
           </Tooltip>
         </div>
       ),
       value: stats.orders.total,
       valueClassName: 'text-2xl sm:text-3xl tracking-tight text-foreground',
       icon: ShoppingCart,
       cardClassName: 'group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-blue-500/20',
       iconWrapperClassName: 'p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300',
       iconClassName: 'h-5 w-5 text-blue-600 dark:text-blue-400',
       footer: (
         <div className="flex flex-col sm:flex-row sm:items-center text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full w-fit">
           <span className="truncate">{stats.orders.active} pesanan aktif</span>
         </div>
       )
     },
     {
       title: (
         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
           <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
             Total Pelanggan
           </span>
           <Tooltip>
             <TooltipTrigger>
               <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
             </TooltipTrigger>
             <TooltipContent>
               <p>Jumlah pelanggan yang telah bertransaksi</p>
             </TooltipContent>
           </Tooltip>
         </div>
       ),
       value: stats.customers.total,
       valueClassName: 'text-2xl sm:text-3xl tracking-tight text-foreground',
       icon: Users,
       cardClassName: 'group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-violet-500/20',
       iconWrapperClassName: 'p-2.5 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/20 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300',
       iconClassName: 'h-5 w-5 text-violet-600 dark:text-violet-400',
       footer: (
         <div className="flex flex-col sm:flex-row sm:items-center text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-full w-fit">
           <span className="truncate">{stats.customers.vip} pelanggan VIP</span>
         </div>
       )
     },
     {
       title: (
         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
           <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
             Bahan Baku
           </span>
           <Tooltip>
             <TooltipTrigger>
               <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
             </TooltipTrigger>
             <TooltipContent>
               <p>Jumlah jenis bahan baku yang tersedia di inventory</p>
             </TooltipContent>
           </Tooltip>
         </div>
       ),
       value: stats.inventory.total,
       valueClassName: 'text-2xl sm:text-3xl tracking-tight text-foreground',
       icon: Package,
       cardClassName: 'group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-amber-500/20',
       iconWrapperClassName: 'p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300',
       iconClassName: 'h-5 w-5 text-amber-600 dark:text-amber-400',
       footer: (
         <div className={cn(
           'flex items-center text-xs font-medium px-2 py-1 rounded-full w-fit',
           stats.inventory.lowStock > 0
             ? 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
             : 'bg-muted text-muted-foreground'
         )}>
           {stats.inventory.lowStock > 0 && <AlertCircle className="h-3 w-3 mr-1.5" />}
           <span className="truncate">
             {stats.inventory.lowStock > 0 ? `${stats.inventory.lowStock} stok menipis` : 'Stok aman'}
           </span>
         </div>
       )
     }
   ]

   return (
     <TooltipProvider>
      <UiStatsCards stats={cards} gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
      </TooltipProvider>
    )
  }

export default StatsCardsSection
