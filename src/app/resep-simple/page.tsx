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
  ChefHat, 
  Plus, 
  Trash2, 
  Clock,
  Users,
  Search,
  BookOpen,
  Star,
  DollarSign,
  Grid3X3,
  List
} from 'lucide-react'

interface SimpleResep {
  id: string
  nama: string
  kategori: string
  porsi: number
  waktuMasak: number // dalam menit
  tingkatKesulitan: 'mudah' | 'sedang' | 'sulit'
  bahan: string[]
  langkah: string[]
  hargaJual: number
  catatan: string
  rating: number
  favorite: boolean
}

const KATEGORI_RESEP = [
  'Roti Manis',
  'Roti Tawar', 
  'Pastry',
  'Cake',
  'Cookies',
  'Donut',
  'Muffin',
  'Lainnya'
]

export default function ResepSimplePage() {
  const { toast } = useToast()
  
  const [resep, setResep] = useState<SimpleResep[]>([
    {
      id: '1',
      nama: 'Roti Sobek Coklat',
      kategori: 'Roti Manis',
      porsi: 8,
      waktuMasak: 45,
      tingkatKesulitan: 'mudah',
      bahan: [
        'Tepung terigu - 500g',
        'Gula pasir - 100g',
        'Ragi instan - 7g',
        'Mentega - 50g',
        'Coklat chip - 100g',
        'Susu cair - 200ml',
        'Telur - 1 butir'
      ],
      langkah: [
        'Campur tepung, gula, dan ragi dalam satu mangkuk',
        'Tambahkan susu cair dan telur, aduk rata',
        'Masukkan mentega, uleni hingga kalis',
        'Tambahkan coklat chip, aduk rata',
        'Diamkan 30 menit hingga mengembang',
        'Bentuk adonan, letakkan di loyang',
        'Panggang 180°C selama 25-30 menit'
      ],
      hargaJual: 25000,
      catatan: 'Bisa ditambah keju parut di atas sebelum dipanggang',
      rating: 5,
      favorite: true
    },
    {
      id: '2',
      nama: 'Cookies Vanilla Simple',
      kategori: 'Cookies',
      porsi: 20,
      waktuMasak: 25,
      tingkatKesulitan: 'mudah',
      bahan: [
        'Tepung terigu - 300g',
        'Mentega - 150g',
        'Gula halus - 100g',
        'Vanilla extract - 1 sdt',
        'Telur - 1 butir'
      ],
      langkah: [
        'Kocok mentega dan gula hingga pucat',
        'Masukkan telur dan vanilla, aduk rata',
        'Tambahkan tepung sedikit demi sedikit',
        'Bentuk bulat, letakkan di loyang',
        'Panggang 160°C selama 15-20 menit'
      ],
      hargaJual: 2000,
      catatan: 'Per piece, bisa dijual dalam kemasan toples',
      rating: 4,
      favorite: false
    }
  ])

  const [newResep, setNewResep] = useState({
    nama: '',
    kategori: KATEGORI_RESEP[0],
    porsi: 1,
    waktuMasak: 30,
    tingkatKesulitan: 'mudah' as 'mudah' | 'sedang' | 'sulit',
    bahan: [''],
    langkah: [''],
    hargaJual: 0,
    catatan: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const addResep = () => {
    if (!newResep.nama || newResep.bahan.some(b => !b.trim()) || newResep.langkah.some(l => !l.trim())) {
      toast({ title: 'Lengkapi semua field yang diperlukan', variant: 'destructive' })
      return
    }

    const resepBaru: SimpleResep = {
      id: Date.now().toString(),
      ...newResep,
      bahan: newResep.bahan.filter(b => b.trim()),
      langkah: newResep.langkah.filter(l => l.trim()),
      rating: 0,
      favorite: false
    }

    setResep(prev => [resepBaru, ...prev])
    setNewResep({
      nama: '',
      kategori: KATEGORI_RESEP[0],
      porsi: 1,
      waktuMasak: 30,
      tingkatKesulitan: 'mudah',
      bahan: [''],
      langkah: [''],
      hargaJual: 0,
      catatan: ''
    })
    setShowAddDialog(false)
    
    toast({ title: 'Resep berhasil ditambahkan!', description: newResep.nama })
  }

  const deleteResep = (id: string) => {
    setResep(prev => prev.filter(item => item.id !== id))
    toast({ title: 'Resep dihapus!' })
  }

  const toggleFavorite = (id: string) => {
    setResep(prev => prev.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ))
  }

  const updateRating = (id: string, rating: number) => {
    setResep(prev => prev.map(item => 
      item.id === id ? { ...item, rating } : item
    ))
  }

  const addBahan = () => {
    setNewResep(prev => ({ ...prev, bahan: [...prev.bahan, ''] }))
  }

  const removeBahan = (index: number) => {
    setNewResep(prev => ({ 
      ...prev, 
      bahan: prev.bahan.filter((_, i) => i !== index)
    }))
  }

  const updateBahan = (index: number, value: string) => {
    setNewResep(prev => ({
      ...prev,
      bahan: prev.bahan.map((item, i) => i === index ? value : item)
    }))
  }

  const addLangkah = () => {
    setNewResep(prev => ({ ...prev, langkah: [...prev.langkah, ''] }))
  }

  const removeLangkah = (index: number) => {
    setNewResep(prev => ({ 
      ...prev, 
      langkah: prev.langkah.filter((_, i) => i !== index)
    }))
  }

  const updateLangkah = (index: number, value: string) => {
    setNewResep(prev => ({
      ...prev,
      langkah: prev.langkah.map((item, i) => i === index ? value : item)
    }))
  }

  const getDifficultyColor = (tingkat: string) => {
    switch (tingkat) {
      case 'mudah': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'sedang': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'sulit': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredResep = resep.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Statistik sederhana
  const stats = {
    totalResep: resep.length,
    favoriteResep: resep.filter(r => r.favorite).length,
    rataWaktuMasak: resep.length > 0 
      ? Math.round(resep.reduce((sum, r) => sum + r.waktuMasak, 0) / resep.length)
      : 0,
    kategoriTerbanyak: resep.length > 0
      ? resep.reduce((acc, r) => {
          acc[r.kategori] = (acc[r.kategori] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      : {}
  }

  const kategoriTerfavorit = Object.entries(stats.kategoriTerbanyak)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Belum ada'

  // Handle edit resep
  const handleEditResep = (item: SimpleResep) => {
    // Set form with existing data
    setNewResep({
      nama: item.nama,
      kategori: item.kategori,
      porsi: item.porsi,
      waktuMasak: item.waktuMasak,
      tingkatKesulitan: item.tingkatKesulitan,
      bahan: [...item.bahan],
      langkah: [...item.langkah],
      hargaJual: item.hargaJual,
      catatan: item.catatan
    })
    setShowAddDialog(true)
  }

  // Table columns definition
  const tableColumns = [
    {
      key: 'nama' as keyof SimpleResep,
      header: 'Nama Resep',
      sortable: true,
      render: (value: string, item: SimpleResep) => (
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            {value}
            {item.favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          </div>
          <div className="text-sm text-muted-foreground">{item.kategori}</div>
        </div>
      )
    },
    {
      key: 'tingkatKesulitan' as keyof SimpleResep,
      header: 'Kesulitan',
      filterable: true,
      filterOptions: [
        { label: 'Mudah', value: 'mudah' },
        { label: 'Sedang', value: 'sedang' },
        { label: 'Sulit', value: 'sulit' }
      ],
      render: (value: string) => {
        const colors = {
          mudah: 'bg-green-100 text-green-800',
          sedang: 'bg-yellow-100 text-yellow-800',
          sulit: 'bg-red-100 text-red-800'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        )
      }
    },
    {
      key: 'porsi' as keyof SimpleResep,
      header: 'Porsi',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'waktuMasak' as keyof SimpleResep,
      header: 'Waktu',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3" />
          <span>{value}m</span>
        </div>
      )
    },
    {
      key: 'hargaJual' as keyof SimpleResep,
      header: 'Harga Jual',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-right text-green-600">Rp {value.toLocaleString()}</div>
      )
    },
    {
      key: 'rating' as keyof SimpleResep,
      header: 'Rating',
      sortable: true,
      hideOnMobile: true,
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
      key: 'bahan' as keyof SimpleResep,
      header: 'Bahan',
      hideOnMobile: true,
      render: (value: string[]) => (
        <div className="text-sm">
          <div>{value.length} bahan</div>
          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
            {value.slice(0, 2).join(', ')}
            {value.length > 2 && '...'}
          </div>
        </div>
      )
    }
  ]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Resep Sederhana
            </h1>
            <p className="text-muted-foreground mt-1">
              Kumpulan resep praktis untuk produksi harian
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
                Tambah Resep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Resep Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Resep</Label>
                    <Input
                      placeholder="Contoh: Roti Sobek Coklat"
                      value={newResep.nama}
                      onChange={(e) => setNewResep(prev => ({ ...prev, nama: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Kategori</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newResep.kategori}
                      onChange={(e) => setNewResep(prev => ({ ...prev, kategori: e.target.value }))}
                    >
                      {KATEGORI_RESEP.map(kategori => (
                        <option key={kategori} value={kategori}>
                          {kategori}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Porsi</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newResep.porsi}
                      onChange={(e) => setNewResep(prev => ({ ...prev, porsi: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label>Waktu (menit)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newResep.waktuMasak}
                      onChange={(e) => setNewResep(prev => ({ ...prev, waktuMasak: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                  <div>
                    <Label>Kesulitan</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newResep.tingkatKesulitan}
                      onChange={(e) => setNewResep(prev => ({ ...prev, tingkatKesulitan: e.target.value as any }))}
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Harga Jual (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={newResep.hargaJual}
                    onChange={(e) => setNewResep(prev => ({ ...prev, hargaJual: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                {/* Bahan */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Bahan-bahan</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBahan}>
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Bahan
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newResep.bahan.map((bahan, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Contoh: Tepung terigu - 500g"
                          value={bahan}
                          onChange={(e) => updateBahan(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBahan(index)}
                          disabled={newResep.bahan.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Langkah */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Langkah-langkah</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLangkah}>
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Langkah
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newResep.langkah.map((langkah, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <Input
                          placeholder={`Langkah ${index + 1}`}
                          value={langkah}
                          onChange={(e) => updateLangkah(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLangkah(index)}
                          disabled={newResep.langkah.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Catatan (opsional)</Label>
                  <Textarea
                    placeholder="Tips atau catatan tambahan..."
                    value={newResep.catatan}
                    onChange={(e) => setNewResep(prev => ({ ...prev, catatan: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button onClick={addResep} className="flex-1">
                    Simpan Resep
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Resep</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalResep}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Favorit</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.favoriteResep}
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
                  <p className="text-sm text-muted-foreground">Rata-rata Waktu</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {stats.rataWaktuMasak}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terpopuler</p>
                  <p className="text-lg font-bold">
                    {kategoriTerfavorit}
                  </p>
                </div>
                <ChefHat className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table or Grid View */}
        {viewMode === 'table' ? (
          <SimpleDataTable
            title="Daftar Resep"
            description="Koleksi resep praktis untuk produksi harian"
            data={resep}
            columns={tableColumns}
            searchPlaceholder="Cari nama resep atau kategori..."
            onAdd={() => setShowAddDialog(true)}
            onEdit={handleEditResep}
            onDelete={(item) => deleteResep(item.id)}
            addButtonText="Tambah Resep"
            emptyMessage="Belum ada resep. Mulai tambahkan resep favorit!"
            exportData={true}
          />
        ) : (
          <>
            {/* Search untuk Grid View */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari resep atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resep Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredResep.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {item.nama}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(item.id)}
                        className="p-0 h-auto"
                      >
                        <Star 
                          className={`h-4 w-4 ${item.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                        />
                      </Button>
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {item.kategori}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(item.tingkatKesulitan)}`}>
                        {item.tingkatKesulitan}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteResep(item.id)}
                    className="text-gray-600 dark:text-gray-400 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Info */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {item.porsi} porsi
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {item.waktuMasak} menit
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Rp {item.hargaJual.toLocaleString()}
                    </div>
                  </div>

                  {/* Rating */}
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

                  {/* Bahan */}
                  <div>
                    <h4 className="font-medium mb-2">Bahan:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                      {item.bahan.slice(0, 3).map((bahan, index) => (
                        <li key={index}>• {bahan}</li>
                      ))}
                      {item.bahan.length > 3 && (
                        <li className="text-xs italic">... dan {item.bahan.length - 3} bahan lainnya</li>
                      )}
                    </ul>
                  </div>

                  {/* Catatan */}
                  {item.catatan && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 dark:text-yellow-200">
                        💡 {item.catatan}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResep.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada resep</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tidak ditemukan resep yang dicari' : 'Mulai tambahkan resep favorit Anda'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Resep
              </Button>
            </CardContent>
          </Card>
        )}
          </>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 Tips Kelola Resep</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100">⭐ Beri Rating</p>
                <p className="text-blue-700 dark:text-blue-200">
                  Rating resep membantu prioritas produksi
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                <p className="font-medium text-green-900 dark:text-green-100">💰 Harga Akurat</p>
                <p className="text-green-700 dark:text-green-200">
                  Update harga jual sesuai kondisi pasar
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">📝 Catat Detail</p>
                <p className="text-yellow-700 dark:text-yellow-200">
                  Tulis tips dan trik di bagian catatan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}