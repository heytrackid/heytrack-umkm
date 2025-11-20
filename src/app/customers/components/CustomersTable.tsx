'use client'

import { ChevronLeft, ChevronRight, Edit2, Eye, Mail, MoreHorizontal, Phone, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton-loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { useResponsive } from '@/hooks/useResponsive'

import type { Row } from '@/types/database'
type CustomerRow = Row<'customers'>

interface CustomerProps {
  customers: CustomerRow[]
  selectedItems: string[]
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onView?: (customer: CustomerRow) => void
  onEdit: (customer: CustomerRow) => void
  onDelete: (customer: CustomerRow) => void
  onAddNew: () => void
  formatCurrency: (amount: number) => string
  isMobile: boolean
  isLoading?: boolean
}

interface MobileCustomerCardProps {
  customer: CustomerRow
  onView?: (customer: CustomerRow) => void
  onEdit: (customer: CustomerRow) => void
  onDelete: (customer: CustomerRow) => void
  formatCurrency: (amount: number) => string
}

const MobileCustomerCard = ({
  customer,
  onView,
  onEdit,
  onDelete,
  formatCurrency
}: MobileCustomerCardProps): JSX.Element => (
    <Card className="hover: ">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{customer.name}</h3>
                <Badge variant={customer.is_active ? "default" : "secondary"} className="text-xs">
                  {customer.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(customer)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(customer)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(customer)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Belanja</p>
              <p className="font-medium text-muted-foreground">
                {formatCurrency(customer.total_spent ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Order</p>
              <p className="font-medium">
                {customer.total_orders ?? 0}
              </p>
            </div>
          </div>

          {/* Last Order */}
          {customer.last_order_date && (
            <div>
              <p className="text-sm text-muted-foreground">Order Terakhir</p>
              <p className="text-sm text-muted-foreground">
                {customer.last_order_date}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

/**
 * Customers Table Component with Pagination
 * Extracted from customers/page.tsx for code splitting
 */
const Customer = ({
  customers,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  formatCurrency,
  isMobile,
  isLoading = false
}: CustomerProps): JSX.Element => {
  const { isMobile: responsiveIsMobile } = useResponsive()
  const mobile = isMobile || responsiveIsMobile

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Calculate pagination
  const totalItems = customers.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const effectivePage = Math.min(currentPage, totalPages || 1)

  // Get paginated data
  const paginatedCustomers = useMemo(() => {
    const startIndex = (effectivePage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return customers.slice(startIndex, endIndex)
  }, [customers, effectivePage, pageSize])

  if (customers.length === 0) {
    return (
      <EmptyState
        {...EmptyStatePresets.customers}
        actions={[
          {
            label: 'Tambah Customer Pertama',
            onClick: onAddNew,
            icon: Plus
          }
        ]}
      />
    )
  }

  if (isLoading) {
    return <TableSkeleton rows={10} columns={7} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Daftar Pelanggan
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Kelola informasi pelanggan Anda
        </p>
      </CardHeader>
      <CardContent>
        {mobile ? (
          <div className="space-y-4">
            {paginatedCustomers.map((customer) => (
              <MobileCustomerCard
                key={customer['id']}
                customer={customer}
                onView={onView || (() => {})}
                onEdit={onEdit}
                onDelete={onDelete}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted/50 w-12">
                  <Checkbox
                    checked={selectedItems.length === customers.length && customers.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead className="bg-muted/50">Nama</TableHead>
                <TableHead className="bg-muted/50">Kontak</TableHead>
                <TableHead className="bg-muted/50">Total Belanja</TableHead>
                <TableHead className="bg-muted/50">Total Order</TableHead>
                <TableHead className="bg-muted/50">Order Terakhir</TableHead>
                <TableHead className="bg-muted/50 text-center w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow key={customer['id']} className="hover:bg-muted">
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(customer['id'].toString())}
                      onCheckedChange={() => onSelectItem(customer['id'].toString())}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{customer.name}</span>
                      <Badge variant={customer.is_active ? "default" : "secondary"} className="w-fit mt-1 text-xs">
                        {customer.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate-desktop-only">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-wrap-mobile">{customer.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(customer.total_spent ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {customer.total_orders ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {customer.last_order_date}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {onView && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => onView(customer)}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                       )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(customer)}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} customers
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select value={pageSize.toString()} onValueChange={(value: string) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-medium">
                    {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
               </div>
             </div>
           )}
         </div>
         )}
       </CardContent>
    </Card>
  )
}

export { Customer as CustomersTable }
