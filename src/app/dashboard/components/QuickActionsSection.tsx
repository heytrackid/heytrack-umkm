'use client'

import { Plus, ChefHat, Package, BarChart3, Users, Calculator, Zap } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const QuickActionsSection = (): JSX.Element => {
  const router = useRouter()

  const quickActions = [
    {
      title: 'Buat Order Baru',
      description: 'Tambah pesanan pelanggan',
      icon: Plus,
      action: (): void => router.push('/orders/new'),
      primary: true
    },
    {
      title: 'Generate Resep',
      description: 'Buat resep dengan AI',
      icon: ChefHat,
      action: (): void => router.push('/recipes/ai-generator')
    },
    {
      title: 'Tambah Bahan',
      description: 'Update inventory',
      icon: Package,
      action: (): void => router.push('/inventory')
    },
    {
      title: 'Lihat Laporan',
      description: 'Analisis performa',
      icon: BarChart3,
      action: (): void => router.push('/reports')
    },
    {
      title: 'Kelola Supplier',
      description: 'Data vendor & bahan',
      icon: Users,
      action: (): void => router.push('/suppliers')
    },
    {
      title: 'Kalkulator HPP',
      description: 'Hitung biaya produksi',
      icon: Calculator,
      action: (): void => router.push('/hpp/calculator')
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Aksi Cepat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? "default" : "outline"}
              className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${
                action.primary ? 'bg-primary hover:bg-primary/90' : ''
              }`}
              onClick={action.action}
            >
              <action.icon className="h-6 w-6" />
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { QuickActionsSection }