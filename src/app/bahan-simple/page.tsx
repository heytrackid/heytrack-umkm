'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Package, 
  Plus, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Search,
  ShoppingCart
} from 'lucide-react'

interface SimpleBahan {
  id: string
  nama: string
  stok: number
  satuan: string
  harga: number
  statusStok: 'aman' | 'rendah' | 'habis'
  stokMinimal: number
  total: number
}

const SATUAN_UMKM = ['kg', 'gram', 'liter', 'ml', 'butir', 'bungkus', 'lembar']

export default function BahanSimplePage() {
  const { toast } = useToast()
  
  const [bahan, setBahan] = useState<SimpleBahan[]>([
    {
      id: '1',
      nama: 'Tepung Terigu',
      stok: 25,
      satuan: 'kg',
      harga: 12000,
      statusStok: 'aman',
      stokMinimal: 10,
      total: 25 * 12000
    },
    {
      id: '2', 
      nama: 'Mentega',
      stok: 3,
      satuan: 'kg',
      harga: 45000,
      statusStok: 'rendah',
      stokMinimal: 5,
      total: 3 * 45000
    },
    {
      id: '3',
      nama: 'Telur',
      stok: 0,
      satuan: 'kg',
      harga: 28000,
      statusStok: 'habis',
      stokMinimal: 3,
      total: 0
    }
  ])

  const [newBahan, setNewBahan] = useState({
    nama: '',
    stok: '',
    satuan: 'kg',
    harga: '',
    stokMinimal: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Auto hitung status stok dan total
  const updateStatusStok = (stok: number, stokMinimal: number): 'aman' | 'rendah' | 'habis' => {
    if (stok === 0) return 'habis'
    if (stok <= stokMinimal) return 'rendah'
    return 'aman'
  }

  const addBahan = () => {
    if (!newBahan.nama || !newBahan.stok || !newBahan.harga) {
      toast({ title: 'Lengkapi semua data', variant: 'destructive' })
      return
    }

    const stok = parseFloat(newBahan.stok)
    const harga = parseFloat(newBahan.harga)
    const stokMinimal = parseFloat(newBahan.stokMinimal) || 5

    if (stok < 0 || harga <= 0) {
      toast({ title: 'Stok dan harga harus valid', variant: 'destructive' })
      return
    }

    const bahanBaru: SimpleBahan = {
      id: Date.now().toString(),
      nama: newBahan.nama,
      stok,
      satuan: newBahan.satuan,
      harga,
      stokMinimal,
      statusStok: updateStatusStok(stok, stokMinimal),
      total: stok * harga
    }

    setBahan(prev => [...prev, bahanBaru])
    setNewBahan({ nama: '', stok: '', satuan: 'kg', harga: '', stokMinimal: '' })
    setShowAddDialog(false)
    
    toast({ 
      title: 'Bahan ditambahkan!', 
      description: `${bahanBaru.nama} - ${stok} ${bahanBaru.satuan}`
    })
  }

  const deleteBahan = (id: string) => {
    setBahan(prev => prev.filter(item => item.id !== id))
    toast({ title: 'Bahan dihapus!' })
  }

  const updateStok = (id: string, newStok: number) => {
    setBahan(prev => prev.map(item => {
      if (item.id === id) {
        const statusStok = updateStatusStok(newStok, item.stokMinimal)
        return {
          ...item,
          stok: newStok,
          statusStok,
          total: newStok * item.harga
        }
      }
      return item
    }))
  }

  const getStatusColor = (status: 'aman' | 'rendah' | 'habis') => {
    switch (status) {
      case 'aman': return 'text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800'
      case 'rendah': return 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700'
      case 'habis': return 'text-gray-500 bg-gray-300 dark:text-gray-400 dark:bg-gray-600'
    }
  }

  const getStatusIcon = (status: 'aman' | 'rendah' | 'habis') => {
    switch (status) {
      case 'aman': return <CheckCircle className="h-4 w-4" />
      case 'rendah': return <AlertTriangle className="h-4 w-4" />
      case 'habis': return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredBahan = bahan.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Statistik sederhana
  const stats = {
    totalBahan: bahan.length,
    bahanHabis: bahan.filter(b => b.statusStok === 'habis').length,
    bahanRendah: bahan.filter(b => b.statusStok === 'rendah').length,
    totalNilai: bahan.reduce((sum, b) => sum + b.total, 0)
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Stok Bahan Bakery
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola stok bahan baku dengan mudah
            </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Bahan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Bahan Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nama Bahan</Label>
                  <Input
                    placeholder="Contoh: Tepung Terigu"
                    value={newBahan.nama}
                    onChange={(e) => setNewBahan(prev => ({ ...prev, nama: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Stok</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={newBahan.stok}
                      onChange={(e) => setNewBahan(prev => ({ ...prev, stok: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Satuan</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newBahan.satuan}
                      onChange={(e) => setNewBahan(prev => ({ ...prev, satuan: e.target.value }))}
                    >
                      {SATUAN_UMKM.map(satuan => (
                        <option key={satuan} value={satuan}>{satuan}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Harga/Unit</Label>
                    <Input
                      type="number"
                      placeholder="12000"
                      value={newBahan.harga}
                      onChange={(e) => setNewBahan(prev => ({ ...prev, harga: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Stok Minimal (Peringatan)</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={newBahan.stokMinimal}
                    onChange={(e) => setNewBahan(prev => ({ ...prev, stokMinimal: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button onClick={addBahan} className="flex-1">
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bahan</p>
                  <p className="text-2xl font-bold">{stats.totalBahan}</p>
                </div>
                <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stok Habis</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.bahanHabis}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stok Rendah</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.bahanRendah}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Nilai</p>
                  <p className="text-lg font-bold">Rp {stats.totalNilai.toLocaleString()}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari bahan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bahan List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBahan.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold">{item.nama}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${getStatusColor(item.statusStok)}`}>
                    {getStatusIcon(item.statusStok)}
                    <span className="capitalize">{item.statusStok}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stok Saat Ini</p>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={item.stok}
                        onChange={(e) => updateStok(item.id, parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">{item.satuan}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harga/Unit</p>
                    <p className="font-medium">Rp {item.harga.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stok Minimal</p>
                    <p className="font-medium">{item.stokMinimal} {item.satuan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Nilai</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Rp {item.total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Peringatan stok */}
                {item.statusStok === 'habis' && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                      ⚠️ Stok habis! Segera beli lagi
                    </p>
                  </div>
                )}

                {item.statusStok === 'rendah' && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                      ⚡ Stok rendah! Perlu diisi ulang
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateStok(item.id, item.stok + 1)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteBahan(item.id)}
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBahan.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada bahan</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tidak ditemukan bahan yang dicari' : 'Mulai dengan menambah bahan pertama'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Bahan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 Tips Kelola Stok</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">🎯 Stok Minimal</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Set stok minimal yang realistis agar tidak kehabisan
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">📱 Update Real-time</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Klik angka stok untuk update langsung saat pakai bahan
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">⚡ Alert Otomatis</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Sistem akan peringati jika stok menipis atau habis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}