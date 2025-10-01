'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import PrefetchLink from '@/components/ui/prefetch-link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react'

export default function IngredientPurchasesPage() {
  const [purchases, setPurchases] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPurchase, setNewPurchase] = useState({
    ingredient_id: '',
    quantity: '',
    unit_price: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    fetchPurchases()
    fetchIngredients()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/ingredient-purchases')
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (response.ok) {
        const data = await response.json()
        setIngredients(data.ingredients || [])
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const totalPrice = parseFloat(newPurchase.quantity) * parseFloat(newPurchase.unit_price)
      
      const response = await fetch('/api/ingredient-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPurchase,
          total_price: totalPrice
        })
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setNewPurchase({
          ingredient_id: '',
          quantity: '',
          unit_price: '',
          supplier: '',
          purchase_date: new Date().toISOString().split('T')[0],
          notes: ''
        })
        fetchPurchases()
        alert('Pembelian berhasil ditambahkan!')
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
      alert('Gagal menambahkan pembelian')
    }
  }

  const stats = [
    {
      title: 'Total Pembelian',
      value: purchases.length,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Pengeluaran',
      value: `Rp ${purchases.reduce((sum, p: any) => sum + (p.total_price || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Item Dibeli',
      value: new Set(purchases.map((p: any) => p.ingredient_id)).size,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/ingredients">Bahan Baku</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pembelian</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Pembelian Bahan Baku
            </h1>
            <p className="text-muted-foreground">
              Kelola riwayat pembelian bahan baku
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pembelian
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Tambah Pembelian Bahan Baku</DialogTitle>
                  <DialogDescription>
                    Input detail pembelian bahan baku baru
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient_id">Bahan Baku *</Label>
                    <Select
                      value={newPurchase.ingredient_id}
                      onValueChange={(value) => setNewPurchase({...newPurchase, ingredient_id: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bahan baku" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ing: any) => (
                          <SelectItem key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Jumlah *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={newPurchase.quantity}
                        onChange={(e) => setNewPurchase({...newPurchase, quantity: e.target.value})}
                        placeholder="100"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit_price">Harga Satuan *</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        step="0.01"
                        value={newPurchase.unit_price}
                        onChange={(e) => setNewPurchase({...newPurchase, unit_price: e.target.value})}
                        placeholder="5000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newPurchase.supplier}
                      onChange={(e) => setNewPurchase({...newPurchase, supplier: e.target.value})}
                      placeholder="Nama supplier"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Tanggal Pembelian *</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={newPurchase.purchase_date}
                      onChange={(e) => setNewPurchase({...newPurchase, purchase_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Input
                      id="notes"
                      value={newPurchase.notes}
                      onChange={(e) => setNewPurchase({...newPurchase, notes: e.target.value})}
                      placeholder="Catatan tambahan"
                    />
                  </div>

                  {newPurchase.quantity && newPurchase.unit_price && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span className="text-lg font-bold">
                          Rp {(parseFloat(newPurchase.quantity) * parseFloat(newPurchase.unit_price)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan Pembelian</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Bahan Baku</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Belum ada data pembelian
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((purchase: any) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          {new Date(purchase.purchase_date).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{purchase.ingredient?.name || '-'}</div>
                            {purchase.notes && (
                              <div className="text-xs text-muted-foreground">{purchase.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{purchase.supplier || '-'}</TableCell>
                        <TableCell className="text-right">
                          {purchase.quantity} {purchase.ingredient?.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {purchase.unit_price?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {purchase.total_price?.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
