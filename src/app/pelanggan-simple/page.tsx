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
import { SimpleDataTable } from '@/components/ui/simple-data-table'
import { 
  Users, 
  Plus, 
  Trash2, 
  Phone,
  MapPin,
  Search,
  ShoppingCart,
  DollarSign,
  Calendar,
  Star,
  MessageCircle,
  Grid3X3,
  List,
  Mail
} from 'lucide-react'

interface SimplePelanggan {
  id: string
  nama: string
  nomorTelepon: string
  alamat: string
  email?: string
  tanggalDaftar: string
  totalPesanan: number
  totalBelanja: number
  pesananTerakhir: string
  catatan: string
  kategori: 'reguler' | 'vip' | 'baru'
  rating: number
  produkFavorit: string[]
}

const KATEGORI_COLORS = {
  baru: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  reguler: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  vip: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
}

export default function PelangganSimplePage() {
  const { toast } = useToast()
  
  const [pelanggan, setPelanggan] = useState<SimplePelanggan[]>([
    {
      id: '1',
      nama: 'Ibu Sari Wati',
      nomorTelepon: '08123456789',
      alamat: 'Jl. Merdeka No. 123, Jakarta',
      email: 'sari@email.com',
      tanggalDaftar: '2024-01-15',
      totalPesanan: 12,
      totalBelanja: 850000,
      pesananTerakhir: '2024-01-25',
      catatan: 'Suka roti manis, biasanya pesan untuk acara kantor',
      kategori: 'vip',
      rating: 5,
      produkFavorit: ['Roti Sobek Coklat', 'Cookies Vanilla', 'Donat Gula']
    },
    {
      id: '2',
      nama: 'Pak Ahmad Yusuf',
      nomorTelepon: '08567890123',
      alamat: 'Perumahan Griya Asri Blok C-15',
      tanggalDaftar: '2024-01-20',
      totalPesanan: 3,
      totalBelanja: 125000,
      pesananTerakhir: '2024-01-25',
      catatan: 'Pelanggan baru, tertarik roti sehat',
      kategori: 'baru',
      rating: 4,
      produkFavorit: ['Roti Tawar', 'Muffin Blueberry']
    }
  ])

  const [newPelanggan, setNewPelanggan] = useState({
    nama: '',
    nomorTelepon: '',
    alamat: '',
    email: '',
    catatan: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('semua')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const addPelanggan = () => {
    if (!newPelanggan.nama || !newPelanggan.nomorTelepon) {
      toast({ title: 'Nama dan nomor telepon wajib diisi', variant: 'destructive' })
      return
    }

    const pelangganBaru: SimplePelanggan = {
      id: Date.now().toString(),
      nama: newPelanggan.nama,
      nomorTelepon: newPelanggan.nomorTelepon,
      alamat: newPelanggan.alamat,
      email: newPelanggan.email,
      tanggalDaftar: new Date().toISOString().split('T')[0],
      totalPesanan: 0,
      totalBelanja: 0,
      pesananTerakhir: '-',
      catatan: newPelanggan.catatan,
      kategori: 'baru',
      rating: 0,
      produkFavorit: []
    }

    setPelanggan(prev => [pelangganBaru, ...prev])
    setNewPelanggan({
      nama: '',
      nomorTelepon: '',
      alamat: '',
      email: '',
      catatan: ''
    })
    setShowAddDialog(false)
    
    toast({ 
      title: 'Pelanggan berhasil ditambahkan!', 
      description: newPelanggan.nama
    })
  }

  const deletePelanggan = (id: string) => {
    setPelanggan(prev => prev.filter(item => item.id !== id))
    toast({ title: 'Data pelanggan dihapus!' })
  }

  const updateRating = (id: string, rating: number) => {
    setPelanggan(prev => prev.map(item => 
      item.id === id ? { ...item, rating } : item
    ))
    toast({ title: `Rating pelanggan diperbarui: ${rating} bintang` })
  }

  // Otomatis update kategori berdasarkan total pembelian
  const updateKategori = (item: SimplePelanggan): SimplePelanggan['kategori'] => {
    if (item.totalBelanja >= 500000) return 'vip'
    if (item.totalPesanan >= 5) return 'reguler'
    return 'baru'
  }

  const addPembelian = (id: string, jumlah: number) => {
    setPelanggan(prev => prev.map(item => {
      if (item.id === id) {
        const newTotalBelanja = item.totalBelanja + jumlah
        const newTotalPesanan = item.totalPesanan + 1
        return {
          ...item,
          totalBelanja: newTotalBelanja,
          totalPesanan: newTotalPesanan,
          pesananTerakhir: new Date().toISOString().split('T')[0],
          kategori: updateKategori({...item, totalBelanja: newTotalBelanja, totalPesanan: newTotalPesanan})
        }
      }
      return item
    }))
  }

  const filteredPelanggan = pelanggan.filter(item => {
    const matchesSearch = 
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorTelepon.includes(searchTerm) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesKategori = kategoriFilter === 'semua' || item.kategori === kategoriFilter
    
    return matchesSearch && matchesKategori
  })

  // Statistik sederhana
  const stats = {
    totalPelanggan: pelanggan.length,
    pelangganBaru: pelanggan.filter(p => p.kategori === 'baru').length,
    pelangganVip: pelanggan.filter(p => p.kategori === 'vip').length,
    rataRating: pelanggan.length > 0 
      ? (pelanggan.reduce((sum, p) => sum + p.rating, 0) / pelanggan.length).toFixed(1)
      : 0,
    totalRevenue: pelanggan.reduce((sum, p) => sum + p.totalBelanja, 0)
  }

  // Handle edit pelanggan
  const handleEditPelanggan = (item: SimplePelanggan) => {
    // Set form with existing data
    setNewPelanggan({
      nama: item.nama,
      nomorTelepon: item.nomorTelepon,
      alamat: item.alamat,
      email: item.email || '',
      catatan: item.catatan
    })
    setShowAddDialog(true)
  }

  // Table columns definition
  const tableColumns = [
    {
      key: 'nama' as keyof SimplePelanggan,
      header: 'Pelanggan',
      sortable: true,
      render: (value: string, item: SimplePelanggan) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {item.nomorTelepon}
          </div>
          {item.email && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {item.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'alamat' as keyof SimplePelanggan,
      header: 'Alamat',
      hideOnMobile: true,
      render: (value: string) => (
        <div className="text-sm max-w-[200px] truncate" title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'kategori' as keyof SimplePelanggan,
      header: 'Kategori',
      filterable: true,
      filterOptions: [
        { label: 'Baru', value: 'baru' },
        { label: 'Reguler', value: 'reguler' },
        { label: 'VIP', value: 'vip' }
      ],
      render: (value: string) => {
        const colors = {
          baru: 'bg-gray-100 text-gray-800',
          reguler: 'bg-blue-100 text-blue-800',
          vip: 'bg-yellow-100 text-yellow-800'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'
          }`}>
            {value.toUpperCase()}
          </span>
        )
      }
    },
    {
      key: 'totalPesanan' as keyof SimplePelanggan,
      header: 'Pesanan',
      sortable: true,
      render: (value: number) => (
        <div className="text-center font-medium">{value}</div>
      )
    },
    {
      key: 'totalBelanja' as keyof SimplePelanggan,
      header: 'Total Belanja',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-right">Rp {value.toLocaleString()}</div>
      )
    },
    {
      key: 'rating' as keyof SimplePelanggan,
      header: 'Rating',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Star 
              key={rating}
              className={`h-3 w-3 ${rating <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
          <span className="text-sm ml-1">({value})</span>
        </div>
      )
    },
    {
      key: 'tanggalDaftar' as keyof SimplePelanggan,
      header: 'Bergabung',
      sortable: true,
      hideOnMobile: true,
      render: (value: string) => {
        const date = new Date(value)
        return <div className="text-sm">{date.toLocaleDateString('id-ID')}</div>
      }
    },
    {
      key: 'pesananTerakhir' as keyof SimplePelanggan,
      header: 'Aktivitas Terakhir',
      hideOnMobile: true,
      render: (value: string) => {
        if (value === '-') return <span className="text-muted-foreground">-</span>
        const date = new Date(value)
        return <div className="text-sm">{date.toLocaleDateString('id-ID')}</div>
      }
    }
  ]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Pelanggan Sederhana
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola data pelanggan dan riwayat pembelian
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button 
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button 
                variant={viewMode === 'table' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none gap-2"
              >
                <List className="h-4 w-4" />
                Tabel
              </Button>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Lengkap *</Label>
                    <Input
                      placeholder="Nama lengkap pelanggan"
                      value={newPelanggan.nama}
                      onChange={(e) => setNewPelanggan(prev => ({ ...prev, nama: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nomor Telepon *</Label>
                    <Input
                      placeholder="08123456789"
                      value={newPelanggan.nomorTelepon}
                      onChange={(e) => setNewPelanggan(prev => ({ ...prev, nomorTelepon: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email (opsional)</Label>
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    value={newPelanggan.email}
                    onChange={(e) => setNewPelanggan(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Alamat</Label>
                  <Textarea
                    placeholder="Alamat lengkap pelanggan..."
                    value={newPelanggan.alamat}
                    onChange={(e) => setNewPelanggan(prev => ({ ...prev, alamat: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Catatan (opsional)</Label>
                  <Textarea
                    placeholder="Catatan tentang preferensi atau info penting..."
                    value={newPelanggan.catatan}
                    onChange={(e) => setNewPelanggan(prev => ({ ...prev, catatan: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button onClick={addPelanggan} className="flex-1">
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {stats.totalPelanggan}
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
                  <p className="text-sm text-muted-foreground">Pelanggan Baru</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.pelangganBaru}
                  </p>
                </div>
                <Plus className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VIP</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.pelangganVip}
                  </p>
                </div>
                <Star className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rata Rating</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.rataRating}
                  </p>
                </div>
                <Star className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    Rp {(stats.totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table or Grid View */}
        {viewMode === 'table' ? (
          <SimpleDataTable
            title="Daftar Pelanggan"
            description="Kelola data pelanggan dan riwayat pembelian"
            data={pelanggan}
            columns={tableColumns}
            searchPlaceholder="Cari nama, telepon, atau alamat..."
            onAdd={() => setShowAddDialog(true)}
            onEdit={handleEditPelanggan}
            onDelete={(item) => deletePelanggan(item.id)}
            addButtonText="Tambah Pelanggan"
            emptyMessage="Belum ada data pelanggan. Tambah pelanggan pertama!"
            exportData={true}
          />
        ) : (
          <>
            {/* Search and Filter untuk Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, telepon, atau alamat..."
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
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                  >
                    <option value="semua">Semua Kategori</option>
                    <option value="baru">Pelanggan Baru</option>
                    <option value="reguler">Pelanggan Reguler</option>
                    <option value="vip">Pelanggan VIP</option>
                  </select>
                </CardContent>
              </Card>
            </div>

            {/* Pelanggan Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPelanggan.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {item.nama}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${KATEGORI_COLORS[item.kategori]}`}>
                        {item.kategori.toUpperCase()}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {item.nomorTelepon}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.tanggalDaftar).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deletePelanggan(item.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Contact Info */}
                  {item.alamat && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{item.alamat}</span>
                    </div>
                  )}

                  {item.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{item.email}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="font-semibold">{item.totalPesanan}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pesanan</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">Rp {(item.totalBelanja / 1000).toFixed(0)}K</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total Belanja</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm">
                          {item.pesananTerakhir !== '-' 
                            ? new Date(item.pesananTerakhir).toLocaleDateString('id-ID')
                            : '-'
                          }
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Terakhir</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rating Pelanggan:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => updateRating(item.id, rating)}
                          className="p-0"
                        >
                          <Star 
                            className={`h-4 w-4 ${rating <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Produk Favorit */}
                  {item.produkFavorit.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Produk Favorit:</h4>
                      <div className="flex flex-wrap gap-1">
                        {item.produkFavorit.slice(0, 3).map((produk, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-blue-700 text-xs rounded"
                          >
                            {produk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catatan */}
                  {item.catatan && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 dark:text-yellow-200">
                        💡 {item.catatan}
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addPembelian(item.id, 50000)}
                      className="flex-1"
                    >
                      + Rp 50K
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addPembelian(item.id, 100000)}
                      className="flex-1"
                    >
                      + Rp 100K
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPelanggan.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada pelanggan</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || kategoriFilter !== 'semua' 
                  ? 'Tidak ditemukan pelanggan yang sesuai filter' 
                  : 'Mulai tambahkan data pelanggan pertama Anda'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </CardContent>
          </Card>
        )}
          </>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 Tips Kelola Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100">📊 Otomatis Upgrade</p>
                <p className="text-blue-700 dark:text-blue-200">
                  Kategori pelanggan otomatis naik berdasarkan pembelian
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                <p className="font-medium text-green-900 dark:text-green-100">⭐ Beri Rating</p>
                <p className="text-green-700 dark:text-green-200">
                  Rating membantu identifikasi pelanggan terbaik
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">📝 Catat Preferensi</p>
                <p className="text-yellow-700 dark:text-yellow-200">
                  Catatan membantu memberikan service personal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}