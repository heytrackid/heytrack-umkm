'use client'

import React, { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { RealTimeSyncDashboard } from '@/components/real-time-sync-dashboard'
import { useDataStore } from '@/lib/data-synchronization'
import { 
  Database, 
  Play, 
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react'

export default function SyncDemoPage() {
  const { toast } = useToast()
  const [demoStep, setDemoStep] = useState(0)
  
  // Store actions
  const updateIngredient = useDataStore((state) => state.updateIngredient)
  const createOrder = useDataStore((state) => state.createOrder)
  const addIngredient = useDataStore((state) => state.addIngredient)
  const addExpense = useDataStore((state) => state.addExpense)
  
  // Store data for display
  const ingredients = useDataStore((state) => state.ingredients)
  const orders = useDataStore((state) => state.orders)
  const customers = useDataStore((state) => state.customers)
  const reports = useDataStore((state) => state.reports)

  const demoSteps = [
    {
      title: 'Update Inventory Stock',
      description: 'Watch how inventory changes affect recipe availability in real-time',
      action: () => {
        // Update tepung terigu stock
        updateIngredient('1', { stok: 5, statusStok: 'rendah' })
        toast({
          title: '📦 Inventory Updated!',
          description: 'Tepung Terigu stock reduced to 5kg - now showing as low stock'
        })
      }
    },
    {
      title: 'Create New Order',
      description: 'See how orders automatically consume inventory and update customer data',
      action: () => {
        createOrder({
          tanggal: new Date(),
          namaPelanggan: 'Bu Ani',
          nomorTelepon: '08123456789',
          items: [
            {
              nama: 'Roti Sobek Coklat',
              jumlah: 2,
              hargaSatuan: 25000,
              subtotal: 50000
            }
          ],
          totalHarga: 50000,
          status: 'pending',
          tanggalAmbil: new Date(),
          catatan: 'Demo order',
          metodeBayar: 'tunai',
          statusBayar: 'belum'
        })
        toast({
          title: '🛒 Order Created!',
          description: 'New order automatically consumed ingredients and updated customer profile'
        })
      }
    },
    {
      title: 'Add New Ingredient',
      description: 'New ingredients immediately become available for recipes',
      action: () => {
        addIngredient({
          nama: 'Coklat Bubuk',
          stok: 10,
          satuan: 'kg',
          harga: 50000,
          stokMinimal: 3,
          total: 500000,
          statusStok: 'aman'
        })
        toast({
          title: '✨ New Ingredient Added!',
          description: 'Coklat Bubuk is now available for recipes'
        })
      }
    },
    {
      title: 'Add Business Expense',
      description: 'Expenses automatically update profit calculations in reports',
      action: () => {
        addExpense({
          tanggal: new Date(),
          kategori: 'Operasional',
          deskripsi: 'Listrik bulanan',
          jumlah: 500000,
          metodeBayar: 'transfer'
        })
        toast({
          title: '💸 Expense Added!',
          description: 'Monthly electricity bill added - reports updated automatically'
        })
      }
    },
    {
      title: 'Restore Stock',
      description: 'Restock ingredients to see recipe availability return to normal',
      action: () => {
        updateIngredient('1', { stok: 25, statusStok: 'aman' })
        updateIngredient('3', { stok: 8, statusStok: 'aman' })
        toast({
          title: '📈 Stock Restored!',
          description: 'All ingredients restocked - recipes are now available again'
        })
      }
    }
  ]

  const runDemo = () => {
    if (demoStep < demoSteps.length) {
      demoSteps[demoStep].action()
      setDemoStep(demoStep + 1)
    } else {
      setDemoStep(0)
      toast({
        title: '🔄 Demo Reset!',
        description: 'Ready to start the synchronization demo again'
      })
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Database className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            Real-Time Data Synchronization Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            See how all modules work together with instant data synchronization
          </p>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Interactive Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium mb-1">
                  Step {demoStep + 1}: {demoStep < demoSteps.length ? demoSteps[demoStep].title : 'Demo Complete'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {demoStep < demoSteps.length ? demoSteps[demoStep].description : 'Click "Run Demo Step" to reset and start over'}
                </p>
              </div>
              <Button onClick={runDemo} className="ml-4">
                <Play className="h-4 w-4 mr-2" />
                {demoStep < demoSteps.length ? `Run Step ${demoStep + 1}` : 'Reset Demo'}
              </Button>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Demo Progress:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{demoStep}/{demoSteps.length} steps completed</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gray-600 dark:bg-gray-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(demoStep / demoSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Data State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingredients</p>
                  <p className="text-2xl font-bold">{ingredients.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {ingredients.filter(ing => ing.statusStok === 'habis').length} out of stock
                  </p>
                </div>
                <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {orders.filter(order => order.status === 'pending').length} pending
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {customers.filter(c => c.customerType === 'new').length} new
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Auto-generated
                  </p>
                </div>
                <Activity className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Sync Dashboard */}
        <RealTimeSyncDashboard showDetailed={true} />

        {/* Sync Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Data Synchronization Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Inventory ↔ Recipes</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Recipe availability updates when stock changes</li>
                  <li>• Missing ingredients are highlighted</li>
                  <li>• Maximum portions calculated automatically</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Orders ↔ Inventory</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Stock automatically consumed on orders</li>
                  <li>• Ingredient tracking per order</li>
                  <li>• Order cancellation restores stock</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Orders ↔ Customers</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Customer profiles auto-created</li>
                  <li>• Purchase history tracked</li>
                  <li>• Customer type classification</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">All ↔ Reports</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Real-time profit calculations</li>
                  <li>• Best selling products tracking</li>
                  <li>• Critical inventory alerts</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Smart Automation</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Event-driven updates</li>
                  <li>• Cross-platform sync ready</li>
                  <li>• Conflict resolution</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Performance</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Instant UI updates</li>
                  <li>• Efficient state management</li>
                  <li>• Minimal re-renders</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use This Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Demo Steps:</h3>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Click "Run Step 1" to reduce ingredient stock</li>
                  <li>Watch recipe availability change in real-time</li>
                  <li>Create an order to see stock consumption</li>
                  <li>Add new ingredients and expenses</li>
                  <li>See reports update automatically</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">What to Watch:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Sync events appearing in real-time</li>
                  <li>Data counts updating instantly</li>
                  <li>Health alerts for critical items</li>
                  <li>Cross-module connections active</li>
                  <li>Report metrics recalculating</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>💡 Pro Tip:</strong> Open multiple tabs (inventory, orders, reports) and run the demo to see 
                changes propagate across all modules simultaneously. This demonstrates the power of centralized 
                state management for UMKM businesses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}