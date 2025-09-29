'use client'

import React, { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Users, 
  Search,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function CustomersPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency, t } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Mock customer data - replace with actual data fetching
  const [customers] = useState([
    {
      id: 1,
      name: 'Sarah Jessica',
      email: 'sarah@email.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 123, Jakarta',
      totalOrders: 15,
      totalSpent: 2450000,
      status: 'active',
      lastOrderDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Ahmad Rahman', 
      email: 'ahmad@email.com',
      phone: '081987654321',
      address: 'Jl. Sudirman No. 45, Bandung',
      totalOrders: 8,
      totalSpent: 1200000,
      status: 'active',
      lastOrderDate: '2024-01-12'
    }
  ])

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredCustomers.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredCustomers.map(customer => customer.id.toString()))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))
    const customerNames = selectedCustomers.map(customer => customer.name).join(', ')
    
    const confirmed = window.confirm(
      `⚠️ Yakin ingin menghapus ${selectedItems.length} pelanggan berikut?\n\n${customerNames}\n\n❗ Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (confirmed) {
      // TODO: Implement actual API call to delete customers
      console.log('Deleting customers:', selectedItems)
      
      // Show success message (in real app, this would be API call)
      alert(`✅ ${selectedItems.length} pelanggan berhasil dihapus!`)
      
      // Clear selection
      setSelectedItems([])
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))
    const customerNames = selectedCustomers.map(customer => customer.name).join(', ')
    
    // TODO: Open bulk edit modal
    console.log('Bulk editing customers:', selectedItems)
    
    alert(`📝 Fitur bulk edit untuk ${selectedItems.length} pelanggan akan segera tersedia!\n\nPelanggan yang dipilih:\n${customerNames}`)
  }

  // Individual action handlers
  const handleEditCustomer = (customer: any) => {
    console.log('Edit customer:', customer)
    setCurrentView('edit')
  }

  const handleDeleteCustomer = (customer: any) => {
    const confirmed = window.confirm(
      `⚠️ KONFIRMASI PENGHAPUSAN\n\nYakin ingin menghapus pelanggan:\n"${customer.name}"\n\n❗ PERHATIAN: Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (confirmed) {
      // TODO: Implement actual API call to delete customer
      console.log('Deleting customer:', customer.id)
      alert(`✅ Pelanggan "${customer.name}" berhasil dihapus dari sistem.`)
    }
  }

  const handleViewCustomer = (customer: any) => {
    console.log('View customer details:', customer)
    // TODO: Open customer detail modal or navigate to customer detail page
    alert(`👤 Detail pelanggan "${customer.name}" akan segera tersedia!`)
  }

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Data Pelanggan', href: currentView === 'list' ? undefined : '/customers' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Pelanggan' : 'Edit Pelanggan' 
      })
    }
    
    return items
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Data Pelanggan
            </h1>
            <p className="text-muted-foreground">
              Kelola database pelanggan dan riwayat pembelian
            </p>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
            <Button variant="outline" className={isMobile ? 'w-full' : ''}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelanggan
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {customers.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Pelanggan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {customers.filter(c => c.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 text-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">Rp</div>
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)}
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Belanja</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 text-orange-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">#</div>
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {Math.round(customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length)}
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Order</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pelanggan berdasarkan nama, email, atau nomor telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {selectedItems.length} pelanggan dipilih
                </span>
                <span className="text-xs text-gray-500">
                  ({filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString())).map(customer => customer.name).slice(0, 2).join(', ')}
                  {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Batal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Semua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Pelanggan
            </CardTitle>
            <p className="text-sm text-gray-600">
              Kelola data pelanggan dengan mudah
            </p>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.length === filteredCustomers.length && filteredCustomers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Nama & Status</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Total Belanja</TableHead>
                      <TableHead>Total Order</TableHead>
                      <TableHead>Terakhir Order</TableHead>
                      <TableHead className="w-32">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(customer.id.toString())}
                            onCheckedChange={() => handleSelectItem(customer.id.toString())}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{customer.name}</span>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="w-fit mt-1 text-xs">
                              {customer.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="truncate max-w-32">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            {formatCurrency(customer.totalSpent)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {customer.totalOrders}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {customer.lastOrderDate}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteCustomer(customer)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data pelanggan'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Coba kata kunci lain untuk menemukan pelanggan'
                    : 'Mulai dengan menambahkan data pelanggan pertama'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setCurrentView('add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pelanggan Pertama
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Tips: Manfaatkan Data Pelanggan
                </h3>
                <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                  <span>• Lacak riwayat pembelian</span>
                  <span>• Analisa pelanggan terbaik</span>
                  <span>• Personalisasi penawaran</span>
                  <span>• Follow up order berkala</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}