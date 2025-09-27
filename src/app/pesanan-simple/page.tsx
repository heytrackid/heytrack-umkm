'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Calendar,
  User,
  Phone,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Package
} from 'lucide-react'

interface SimplePesanan {
  id: string
  tanggal: string
  namaPelanggan: string
  nomorTelepon: string
  items: PesananItem[]
  totalHarga: number
  status: 'pending' | 'proses' | 'selesai' | 'batal'
  tanggalAmbil: string
  catatan: string
  metodeBayar: 'tunai' | 'transfer' | 'kartu'
  statusBayar: 'belum' | 'dp' | 'lunas'
}

interface PesananItem {
  nama: string
  jumlah: number
  hargaSatuan: number
  subtotal: number
}

const STATUS_COLORS = {
  pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  proses: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  selesai: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  batal: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
}

const STATUS_BAYAR_COLORS = {
  belum: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  dp: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  lunas: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
}

const PRODUK_POPULER = [
  { nama: 'Roti Sobek Coklat', harga: 25000 },
  { nama: 'Cookies Vanilla', harga: 2000 },
  { nama: 'Donat Gula', harga: 5000 },
  { nama: 'Roti Tawar', harga: 15000 },
  { nama: 'Croissant', harga: 8000 },
  { nama: 'Muffin Blueberry', harga: 12000 }
]

export default function PesananSimplePage() {
  const { toast } = useToast()
  
  const [pesanan, setPesanan] = useState<SimplePesanan[]>([
    {
      id: '1',
      tanggal: '2024-01-25',
      namaPelanggan: 'Ibu Sari',
      nomorTelepon: '08123456789',
      items: [
        { nama: 'Roti Sobek Coklat', jumlah: 2, hargaSatuan: 25000, subtotal: 50000 },
        { nama: 'Cookies Vanilla', jumlah: 20, hargaSatuan: 2000, subtotal: 40000 }
      ],
      totalHarga: 90000,
      status: 'proses',
      tanggalAmbil: '2024-01-26',
      catatan: 'Tolong dibuat agak manis',
      metodeBayar: 'tunai',
      statusBayar: 'dp'
    },
    {
      id: '2',
      tanggal: '2024-01-25',
      namaPelanggan: 'Pak Ahmad',
      nomorTelepon: '08567890123',
      items: [
        { nama: 'Roti Tawar', jumlah: 3, hargaSatuan: 15000, subtotal: 45000 }
      ],
      totalHarga: 45000,
      status: 'pending',
      tanggalAmbil: '2024-01-25',
      catatan: '',
      metodeBayar: 'transfer',
      statusBayar: 'lunas'
    }
  ])

  const [newPesanan, setNewPesanan] = useState({
    namaPelanggan: '',
    nomorTelepon: '',
    items: [{ nama: '', jumlah: 1, hargaSatuan: 0 }] as Omit<PesananItem, 'subtotal'>[],
    tanggalAmbil: new Date().toISOString().split('T')[0],
    catatan: '',
    metodeBayar: 'tunai' as 'tunai' | 'transfer' | 'kartu',
    statusBayar: 'belum' as 'belum' | 'dp' | 'lunas'
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const addPesanan = () => {
    if (!newPesanan.namaPelanggan || !newPesanan.nomorTelepon || newPesanan.items.some(i => !i.nama || i.jumlah <= 0)) {
      toast({ title: 'Lengkapi semua field yang diperlukan', variant: 'destructive' })
      return
    }

    const itemsWithSubtotal = newPesanan.items.map(item => ({
      ...item,
      subtotal: item.jumlah * item.hargaSatuan
    }))

    const totalHarga = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0)

    const pesananBaru: SimplePesanan = {
      id: Date.now().toString(),
      tanggal: new Date().toISOString().split('T')[0],
      namaPelanggan: newPesanan.namaPelanggan,
      nomorTelepon: newPesanan.nomorTelepon,
      items: itemsWithSubtotal,
      totalHarga,
      status: 'pending',
      tanggalAmbil: newPesanan.tanggalAmbil,
      catatan: newPesanan.catatan,
      metodeBayar: newPesanan.metodeBayar,
      statusBayar: newPesanan.statusBayar
    }

    setPesanan(prev => [pesananBaru, ...prev])
    setNewPesanan({
      namaPelanggan: '',
      nomorTelepon: '',
      items: [{ nama: '', jumlah: 1, hargaSatuan: 0 }],
      tanggalAmbil: new Date().toISOString().split('T')[0],
      catatan: '',
      metodeBayar: 'tunai',
      statusBayar: 'belum'
    })
    setShowAddDialog(false)
    
    toast({ 
      title: 'Pesanan berhasil ditambahkan!', 
      description: `${newPesanan.namaPelanggan} - Rp ${totalHarga.toLocaleString()}`
    })
  }

  const deletePesanan = (id: string) => {
    setPesanan(prev => prev.filter(item => item.id !== id))
    toast({ title: 'Pesanan dihapus!' })
  }

  const updateStatus = (id: string, status: SimplePesanan['status']) => {
    setPesanan(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ))
    toast({ title: `Status pesanan diubah menjadi ${status}` })
  }

  const updateStatusBayar = (id: string, statusBayar: SimplePesanan['statusBayar']) => {
    setPesanan(prev => prev.map(item => 
      item.id === id ? { ...item, statusBayar } : item
    ))
    toast({ title: `Status pembayaran diubah menjadi ${statusBayar}` })
  }

  const addItem = () => {
    setNewPesanan(prev => ({
      ...prev,
      items: [...prev.items, { nama: '', jumlah: 1, hargaSatuan: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    setNewPesanan(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof Omit<PesananItem, 'subtotal'>, value: string | number) => {
    setNewPesanan(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const selectProduk = (index: number, produk: typeof PRODUK_POPULER[0]) => {
    updateItem(index, 'nama', produk.nama)
    updateItem(index, 'hargaSatuan', produk.harga)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'proses': return <AlertCircle className="h-4 w-4" />
      case 'selesai': return <CheckCircle className="h-4 w-4" />
      case 'batal': return <Trash2 className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredPesanan = pesanan.filter(item => {
    const matchesSearch = 
      item.namaPelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorTelepon.includes(searchTerm) ||
      item.items.some(i => i.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Statistik sederhana
  const stats = {
    totalPesanan: pesanan.length,
    pesananHariIni: pesanan.filter(p => p.tanggal === new Date().toISOString().split('T')[0]).length,
    totalPendapatan: pesanan
      .filter(p => p.status === 'selesai')
      .reduce((sum, p) => sum + p.totalHarga, 0),
    pesananPending: pesanan.filter(p => p.status === 'pending').length
  }

  const totalEstimate = newPesanan.items.reduce((sum, item) => 
    sum + (item.jumlah * item.hargaSatuan), 0
  )

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Pesanan Sederhana
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola pesanan pelanggan dengan mudah
            </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Pesanan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Pesanan Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Pelanggan</Label>
                    <Input
                      placeholder="Nama lengkap pelanggan"
                      value={newPesanan.namaPelanggan}
                      onChange={(e) => setNewPesanan(prev => ({ ...prev, namaPelanggan: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nomor Telepon</Label>
                    <Input
                      placeholder="08123456789"
                      value={newPesanan.nomorTelepon}
                      onChange={(e) => setNewPesanan(prev => ({ ...prev, nomorTelepon: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tanggal Ambil</Label>
                    <Input
                      type="date"
                      value={newPesanan.tanggalAmbil}
                      onChange={(e) => setNewPesanan(prev => ({ ...prev, tanggalAmbil: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Metode Bayar</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newPesanan.metodeBayar}
                      onChange={(e) => setNewPesanan(prev => ({ ...prev, metodeBayar: e.target.value as any }))}
                    >
                      <option value="tunai">Tunai</option>
                      <option value="transfer">Transfer</option>
                      <option value="kartu">Kartu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Status Pembayaran</Label>
                  <select 
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={newPesanan.statusBayar}
                    onChange={(e) => setNewPesanan(prev => ({ ...prev, statusBayar: e.target.value as any }))}
                  >
                    <option value="belum">Belum Bayar</option>
                    <option value="dp">DP/Uang Muka</option>
                    <option value="lunas">Lunas</option>
                  </select>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Item Pesanan</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {newPesanan.items.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Item #{index + 1}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={newPesanan.items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Produk</Label>
                            <Input
                              placeholder="Nama produk"
                              value={item.nama}
                              onChange={(e) => updateItem(index, 'nama', e.target.value)}
                            />
                            {/* Quick select produk */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {PRODUK_POPULER.slice(0, 3).map((produk) => (
                                <button
                                  key={produk.nama}
                                  type="button"
                                  onClick={() => selectProduk(index, produk)}
                                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  {produk.nama}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Harga Satuan</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.hargaSatuan}
                              onChange={(e) => updateItem(index, 'hargaSatuan', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Jumlah</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.jumlah}
                              onChange={(e) => updateItem(index, 'jumlah', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Subtotal</Label>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-medium">
                              Rp {(item.jumlah * item.hargaSatuan).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Pesanan:</span>
                      <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                        Rp {totalEstimate.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Catatan (opsional)</Label>
                  <Textarea
                    placeholder="Catatan khusus untuk pesanan..."
                    value={newPesanan.catatan}
                    onChange={(e) => setNewPesanan(prev => ({ ...prev, catatan: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button onClick={addPesanan} className="flex-1">
                    Buat Pesanan
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
                  <p className="text-sm text-muted-foreground">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.totalPesanan}
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
                  <p className="text-sm text-muted-foreground">Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.pesananHariIni}
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
                  <p className="text-sm text-muted-foreground">Pendapatan</p>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                    Rp {stats.totalPendapatan.toLocaleString()}
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
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.pesananPending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, telepon, atau produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="semua">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="proses">Dalam Proses</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Dibatal</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Pesanan List */}
        <div className="space-y-4">
          {filteredPesanan.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      {item.namaPelanggan}
                      <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[item.status]}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {item.nomorTelepon}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Ambil: {new Date(item.tanggalAmbil).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${STATUS_BAYAR_COLORS[item.statusBayar]}`}>
                      {item.statusBayar}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deletePesanan(item.id)}
                      className="text-gray-600 dark:text-gray-400 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Item Pesanan:
                    </h4>
                    <div className="space-y-1">
                      {item.items.map((orderItem, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{orderItem.nama} x {orderItem.jumlah}</span>
                          <span className="font-medium">Rp {orderItem.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                        Rp {item.totalHarga.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.metodeBayar} • {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  {/* Catatan */}
                  {item.catatan && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 dark:text-yellow-200">
                        💬 {item.catatan}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <select 
                      className="px-3 py-1 border border-input rounded text-sm bg-background"
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value as any)}
                    >
                      <option value="pending">Pending</option>
                      <option value="proses">Proses</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Batal</option>
                    </select>

                    <select 
                      className="px-3 py-1 border border-input rounded text-sm bg-background"
                      value={item.statusBayar}
                      onChange={(e) => updateStatusBayar(item.id, e.target.value as any)}
                    >
                      <option value="belum">Belum Bayar</option>
                      <option value="dp">DP</option>
                      <option value="lunas">Lunas</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPesanan.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada pesanan</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'semua' 
                  ? 'Tidak ditemukan pesanan yang sesuai filter' 
                  : 'Mulai terima pesanan pertama Anda'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Pesanan Baru
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 Tips Kelola Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100">📱 Catat Kontak</p>
                <p className="text-blue-700 dark:text-blue-200">
                  Simpan nomor telepon untuk konfirmasi pesanan
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                <p className="font-medium text-green-900 dark:text-green-100">💰 Update Status</p>
                <p className="text-green-700 dark:text-green-200">
                  Selalu update status pesanan dan pembayaran
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">📅 Jadwal Ambil</p>
                <p className="text-yellow-700 dark:text-yellow-200">
                  Set tanggal ambil yang realistis untuk produksi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}