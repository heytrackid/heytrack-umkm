'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Receipt,
  ArrowLeft,
  ChevronRight,
  Home,
  Zap,
  Fuel,
  Building,
  Users,
  Truck,
  Wifi,
  Phone,
  ShieldCheck,
  Wrench,
  RefreshCw
} from 'lucide-react'

interface OperationalCost {
  id: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  description?: string
  isFixed: boolean
  icon: string
}

const costCategories = [
  { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
  { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
  { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
  { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
  { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
  { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
  { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
  { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' }
]

const frequencies = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' }
]

export default function OperationalCostsPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const [costs, setCosts] = useState<OperationalCost[]>([
    {
      id: '1',
      name: 'Listrik',
      category: 'utilities',
      amount: 500000,
      frequency: 'monthly',
      description: 'Biaya listrik bulanan',
      isFixed: false,
      icon: '⚡'
    },
    {
      id: '2', 
      name: 'Sewa Tempat',
      category: 'rent',
      amount: 2000000,
      frequency: 'monthly',
      description: 'Sewa kios/warung',
      isFixed: true,
      icon: '🏢'
    }
  ])
  
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null)
  const [newCost, setNewCost] = useState<OperationalCost>({
    id: '',
    name: '',
    category: 'utilities',
    amount: 0,
    frequency: 'monthly',
    description: '',
    isFixed: false,
    icon: '⚡'
  })

  const resetForm = () => {
    setNewCost({
      id: '',
      name: '',
      category: 'utilities',
      amount: 0,
      frequency: 'monthly',
      description: '',
      isFixed: false,
      icon: '⚡'
    })
    setEditingCost(null)
  }

  const handleSaveCost = () => {
    if (currentView === 'add') {
      const id = Date.now().toString()
      const categoryData = costCategories.find(cat => cat.id === newCost.category)
      const costToAdd = { 
        ...newCost, 
        id,
        icon: categoryData?.icon || '📦'
      }
      setCosts([...costs, costToAdd])
    } else if (currentView === 'edit' && editingCost) {
      setCosts(costs.map(cost => 
        cost.id === editingCost.id ? { ...newCost, id: editingCost.id } : cost
      ))
    }
    resetForm()
    setCurrentView('list')
  }

  const handleEditCost = (cost: OperationalCost) => {
    setEditingCost(cost)
    setNewCost({ ...cost })
    setCurrentView('edit')
  }

  const handleDeleteCost = (costId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus biaya ini?')) {
      setCosts(costs.filter(cost => cost.id !== costId))
    }
  }

  const calculateMonthlyCost = (cost: OperationalCost): number => {
    switch (cost.frequency) {
      case 'daily': return cost.amount * 30
      case 'weekly': return cost.amount * 4.33
      case 'monthly': return cost.amount
      case 'yearly': return cost.amount / 12
      default: return cost.amount
    }
  }

  const getTotalMonthlyCosts = (): number => {
    return costs.reduce((total, cost) => total + calculateMonthlyCost(cost), 0)
  }

  // Breadcrumb component
  const Breadcrumb = () => (
    <nav className="flex items-center space-x-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = '/'}
        className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4 mr-1" />
        Dashboard
      </Button>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      {currentView === 'list' ? (
        <span className="font-medium">Biaya Operasional</span>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('list')}
            className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            Biaya Operasional
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {currentView === 'add' ? 'Tambah Biaya' : 'Edit Biaya'}
          </span>
        </>
      )}
    </nav>
  )

  // Form Component
  const CostForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetForm()
            setCurrentView('list')
          }}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {currentView === 'add' ? 'Tambah' : 'Edit'} Biaya Operasional
          </h2>
          <p className="text-muted-foreground">
            {currentView === 'add' ? 'Tambahkan biaya operasional baru' : 'Edit biaya operasional'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Biaya</Label>
              <Input
                value={newCost.name}
                onChange={(e) => setNewCost(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Listrik"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select 
                value={newCost.category} 
                onValueChange={(value) => setNewCost(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {costCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name} - {category.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jumlah Biaya</Label>
              <Input
                type="number"
                value={newCost.amount}
                onChange={(e) => setNewCost(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Frekuensi</Label>
              <Select 
                value={newCost.frequency} 
                onValueChange={(value: any) => setNewCost(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi (Opsional)</Label>
            <Textarea
              value={newCost.description}
              onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi tambahan..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFixed"
              checked={newCost.isFixed}
              onChange={(e) => setNewCost(prev => ({ ...prev, isFixed: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isFixed" className="text-sm">
              Biaya tetap (tidak berubah setiap periode)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveCost} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan Biaya
            </Button>
            <Button variant="outline" onClick={() => {
              resetForm()
              setCurrentView('list')
            }}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // List Component
  const CostList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Biaya Operasional
          </h1>
          <p className="text-muted-foreground">
            Kelola biaya operasional bisnis untuk perhitungan HPP yang akurat
          </p>
        </div>
        <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Biaya
        </Button>
      </div>

      {/* Summary Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card>
          <CardContent className="p-4 text-center">
            <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{costs.length}</div>
            <p className="text-sm text-muted-foreground">Total Biaya</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{costs.filter(c => c.isFixed).length}</div>
            <p className="text-sm text-muted-foreground">Biaya Tetap</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(getTotalMonthlyCosts())}</div>
            <p className="text-sm text-muted-foreground">Total/Bulan</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 dark:bg-orange-800/50 p-2 rounded-lg">
              <Receipt className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                💡 Mengapa Biaya Operasional Penting?
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Biaya operasional digunakan untuk menghitung HPP yang akurat. 
                Semakin lengkap data biaya, semakin tepat perhitungan harga jual produk Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs by Category */}
      {costCategories.map(category => {
        const categoryCosts = costs.filter(cost => cost.category === category.id)
        if (categoryCosts.length === 0) return null

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-xl">{category.icon}</span>
                {category.name}
                <Badge variant="outline">{categoryCosts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryCosts.map(cost => (
                  <div key={cost.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{cost.name}</h4>
                        {cost.isFixed && (
                          <Badge variant="secondary" className="text-xs">
                            TETAP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {formatCurrency(cost.amount)} / {frequencies.find(f => f.value === cost.frequency)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ~{formatCurrency(calculateMonthlyCost(cost))}/bulan
                      </p>
                      {cost.description && (
                        <p className="text-xs text-muted-foreground mt-1">{cost.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCost(cost)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCost(cost.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {costs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">Belum Ada Biaya Operasional</h3>
            <p className="text-muted-foreground mb-4">
              Mulai tambahkan biaya operasional seperti listrik, sewa, gaji karyawan, dll.
            </p>
            <Button onClick={() => setCurrentView('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Biaya Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb />
        {currentView === 'list' ? <CostList /> : <CostForm />}
      </div>
    </AppLayout>
  )
}