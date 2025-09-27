'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Receipt, 
  Plus, 
  Trash2, 
  DollarSign,
  Calendar,
  Search,
  Building,
  Zap,
  Users,
  Car
} from 'lucide-react'

interface SimplePengeluaran {
  id: string
  tanggal: string
  kategori: string
  deskripsi: string
  jumlah: number
  metode: 'tunai' | 'transfer' | 'kartu'
}

const KATEGORI_UMKM = [
  { value: 'sewa', label: 'Sewa Toko', icon: Building, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  { value: 'listrik', label: 'Listrik & Air', icon: Zap, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  { value: 'gaji', label: 'Gaji Karyawan', icon: Users, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  { value: 'transport', label: 'Transportasi', icon: Car, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
  { value: 'lainnya', label: 'Lain-lain', icon: Receipt, color: 'bg-gray-100 text-gray-800' }
]

export default function PengeluaranSimplePage() {
  const { toast } = useToast()
  
  const [pengeluaran, setPengeluaran] = useState<SimplePengeluaran[]>([
    {
      id: '1',
      tanggal: '2024-01-25',
      kategori: 'sewa',
      deskripsi: 'Sewa toko bulan Januari',
      jumlah: 3000000,
      metode: 'transfer'
    },
    {
      id: '2',
      tanggal: '2024-01-24',
      kategori: 'listrik',
      deskripsi: 'Bayar listrik bulanan',
      jumlah: 450000,
      metode: 'transfer'
    },
    {
      id: '3',
      tanggal: '2024-01-23',
      kategori: 'gaji',
      deskripsi: 'Gaji karyawan mingguan',
      jumlah: 1200000,
      metode: 'tunai'
    }
  ])

  const [newPengeluaran, setNewPengeluaran] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'lainnya',
    deskripsi: '',
    jumlah: '',
    metode: 'tunai' as 'tunai' | 'transfer' | 'kartu'
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const addPengeluaran = () => {
    if (!newPengeluaran.deskripsi || !newPengeluaran.jumlah) {
      toast({ title: 'Lengkapi deskripsi dan jumlah', variant: 'destructive' })
      return
    }

    const jumlah = parseFloat(newPengeluaran.jumlah)
    if (jumlah <= 0) {
      toast({ title: 'Jumlah harus lebih dari 0', variant: 'destructive' })
      return
    }

    const pengeluaranBaru: SimplePengeluaran = {
      id: Date.now().toString(),
      tanggal: newPengeluaran.tanggal,
      kategori: newPengeluaran.kategori,
      deskripsi: newPengeluaran.deskripsi,
      jumlah,
      metode: newPengeluaran.metode
    }

    setPengeluaran(prev => [pengeluaranBaru, ...prev])
    setNewPengeluaran({
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'lainnya',
      deskripsi: '',
      jumlah: '',
      metode: 'tunai'
    })
    setShowAddDialog(false)
    
    toast({ 
      title: 'Pengeluaran ditambahkan!', 
      description: `Rp ${jumlah.toLocaleString()}`
    })
  }

  const deletePengeluaran = (id: string) => {
    setPengeluaran(prev => prev.filter(item => item.id !== id))
    toast({ title: 'Pengeluaran dihapus!' })
  }

  const getKategoriInfo = (kategori: string) => {
    return KATEGORI_UMKM.find(k => k.value === kategori) || KATEGORI_UMKM[KATEGORI_UMKM.length - 1]
  }

  const filteredPengeluaran = pengeluaran.filter(item =>
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getKategoriInfo(item.kategori).label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Statistik sederhana
  const stats = {
    totalPengeluaran: pengeluaran.reduce((sum, p) => sum + p.jumlah, 0),
    pengeluaranHariIni: pengeluaran
      .filter(p => p.tanggal === new Date().toISOString().split('T')[0])
      .reduce((sum, p) => sum + p.jumlah, 0),
    pengeluaranBulan: pengeluaran
      .filter(p => p.tanggal.startsWith(new Date().toISOString().slice(0, 7)))
      .reduce((sum, p) => sum + p.jumlah, 0),
    rataHarian: pengeluaran.length > 0 
      ? pengeluaran.reduce((sum, p) => sum + p.jumlah, 0) / pengeluaran.length 
      : 0
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Pengeluaran Harian
            </h1>
            <p className="text-muted-foreground mt-1">
              Catat semua pengeluaran bisnis dengan mudah
            </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Catat Pengeluaran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={newPengeluaran.tanggal}
                      onChange={(e) => setNewPengeluaran(prev => ({ ...prev, tanggal: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Kategori</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newPengeluaran.kategori}
                      onChange={(e) => setNewPengeluaran(prev => ({ ...prev, kategori: e.target.value }))}
                    >
                      {KATEGORI_UMKM.map(kategori => (
                        <option key={kategori.value} value={kategori.value}>
                          {kategori.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Input
                    placeholder="Contoh: Bayar listrik bulan ini"
                    value={newPengeluaran.deskripsi}
                    onChange={(e) => setNewPengeluaran(prev => ({ ...prev, deskripsi: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Jumlah (Rp)</Label>
                    <Input
                      type="number"
                      placeholder="450000"
                      value={newPengeluaran.jumlah}
                      onChange={(e) => setNewPengeluaran(prev => ({ ...prev, jumlah: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Cara Bayar</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newPengeluaran.metode}
                      onChange={(e) => setNewPengeluaran(prev => ({ ...prev, metode: e.target.value as any }))}
                    >
                      <option value="tunai">Tunai</option>
                      <option value="transfer">Transfer</option>
                      <option value="kartu">Kartu</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button onClick={addPengeluaran} className="flex-1">
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
                  <p className="text-sm text-muted-foreground">Total Bulan Ini</p>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                    Rp {stats.pengeluaranBulan.toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hari Ini</p>
                  <p className="text-xl font-bold">
                    Rp {stats.pengeluaranHariIni.toLocaleString()}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Semua</p>
                  <p className="text-lg font-bold">
                    Rp {stats.totalPengeluaran.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata</p>
                  <p className="text-lg font-bold">
                    Rp {stats.rataHarian.toLocaleString()}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-gray-600 dark:text-gray-400" />
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
                placeholder="Cari pengeluaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pengeluaran List */}
        <div className="space-y-3">
          {filteredPengeluaran.map((item) => {
            const kategoriInfo = getKategoriInfo(item.kategori)
            const IconComponent = kategoriInfo.icon
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${kategoriInfo.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.deskripsi}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${kategoriInfo.color}`}>
                            {kategoriInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                          <span className="capitalize">{item.metode}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                          Rp {item.jumlah.toLocaleString()}
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deletePengeluaran(item.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredPengeluaran.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada pengeluaran</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tidak ditemukan pengeluaran yang dicari' : 'Mulai catat pengeluaran harian Anda'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Catat Pengeluaran
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 Tips Kelola Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100">📝 Catat Langsung</p>
                <p className="text-blue-700 dark:text-blue-200">
                  Langsung catat setiap pengeluaran agar tidak lupa
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                <p className="font-medium text-green-900 dark:text-green-100">🏷️ Pakai Kategori</p>
                <p className="text-green-700 dark:text-green-200">
                  Kategorikan dengan benar untuk analisa yang lebih baik
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">📊 Pantau Bulanan</p>
                <p className="text-yellow-700 dark:text-yellow-200">
                  Cek total bulanan untuk kontrol anggaran
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}