'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Mail,
  Phone,
  Eye,
  Edit2,
  Trash2,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface CustomersTableProps {
  customers: any[]
  selectedItems: string[]
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onView: (customer: any) => void
  onEdit: (customer: any) => void
  onDelete: (customer: any) => void
  onAddNew: () => void
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

/**
 * Customers Table Component with Pagination
 * Extracted from customers/page.tsx for code splitting
 */
export default function CustomersTable({
  customers,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  formatCurrency,
  isMobile = false
}: CustomersTableProps) {
  
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
    setCurrentPage(1)
  }, [customers.length])

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {"Placeholder"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {"Placeholder"}
          </p>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {"Placeholder"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {"Placeholder"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {"Placeholder"}
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
                <TableHead>{"Placeholder"}</TableHead>
                <TableHead>{"Placeholder"}</TableHead>
                <TableHead>{"Placeholder"}</TableHead>
                <TableHead>{"Placeholder"}</TableHead>
                <TableHead>{"Placeholder"}</TableHead>
                <TableHead className="w-32">{"Placeholder"}</TableHead>
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
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="w-fit mt-1 text-xs">
                        {customer.status === 'active' ? "Placeholder" : "Placeholder"}
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
                          <DropdownMenuItem onClick={() => onEdi""}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            {"Placeholder"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete(customer)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {"Placeholder"}
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
                  {t('customers.pagination.showing', {
                    from: ((currentPage - 1) * pageSize) + 1,
                    to: Math.min(currentPage * pageSize, totalItems),
                    total: totalItems
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{"Placeholder"}</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
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
                    {"Placeholder"}
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