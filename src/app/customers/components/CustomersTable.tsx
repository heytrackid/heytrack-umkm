import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { ChevronLeft, ChevronRight, Edit2, Eye, Mail, MoreHorizontal, Phone, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { CustomersTable } from '@/types/database'

interface CustomersTableProps {
  customers: CustomersTable[]
  selectedItems: string[]
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onView: (customer: CustomersTable) => void
  onEdit: (customer: CustomersTable) => void
  onDelete: (customer: CustomersTable) => void
  onAddNew: () => void
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

/**
 * Customers Table Component with Pagination
 * Extracted from customers/page.tsx for code splitting
 */
const CustomersTable = ({
  customers,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  formatCurrency
}: CustomersTableProps) => {

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Calculate pagination
  const totalItems = customers.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Get paginated data
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return customers.slice(startIndex, endIndex)
  }, [customers, currentPage, pageSize])

  // Reset to page 1 when customers change
  useMemo(() => {
    void setCurrentPage(1)
  }, [customers.length])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Daftar Pelanggan
        </CardTitle>
        <p className="text-sm text-gray-600">
          Kelola informasi pelanggan Anda
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === customers.length && customers.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Total Belanja</TableHead>
                <TableHead>Total Order</TableHead>
                <TableHead>Order Terakhir</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(customer.id.toString())}
                      onCheckedChange={() => onSelectItem(customer.id.toString())}
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
                        <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate-desktop-only">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-wrap-mobile">{customer.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {formatCurrency(customer.total_spent ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {customer.total_orders ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {customer.last_order_date}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(customer)}
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
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(customer)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
                    void setCurrentPage(1)
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
      </CardContent>
    </Card>
  )
}

export default CustomersTable
