'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MessageCircle,
  Download,
  Printer,
  RefreshCw,
  Archive
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Order {
  id: string
  order_no: string
  customer_name: string
  customer_phone?: string
  status: string
  priority: string
  order_date: string
  delivery_date?: string
  total_amount: number
  paid_amount: number
  payment_status: string
  order_items?: Array<{
    product_name: string
    quantity: number
  }>
}

interface OrdersTableProps {
  orders: Order[]
  loading?: boolean
  onViewOrder: (order: Order) => void
  onEditOrder: (order: Order) => void
  onDeleteOrder?: (order: Order) => void
  onUpdateStatus?: (orderId: string, status: string) => void
  onBulkAction?: (action: string, orderIds: string[]) => void
}

const OrdersTable = ({
  orders,
  loading = false,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onBulkAction
}: OrdersTableProps) => {
  const { formatCurrency } = useCurrency()
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  // Status configurations
  const statusConfig = {
    'PENDING': { label: "Placeholder", color: 'bg-yellow-100 text-yellow-800', textColor: 'text-yellow-800' },
    'CONFIRMED': { label: "Placeholder", color: 'bg-blue-100 text-blue-800', textColor: 'text-blue-800' },
    'IN_PROGRESS': { label: "Placeholder", color: 'bg-orange-100 text-orange-800', textColor: 'text-orange-800' },
    'READY': { label: "Placeholder", color: 'bg-green-100 text-green-800', textColor: 'text-green-800' },
    'DELIVERED': { label: "Placeholder", color: 'bg-gray-100 text-gray-800', textColor: 'text-gray-800' },
    'CANCELLED': { label: "Placeholder", color: 'bg-red-100 text-red-800', textColor: 'text-red-800' }
  }

  const paymentStatusConfig = {
    'UNPAID': { label: "Placeholder", color: 'bg-red-100 text-red-800' },
    'PARTIAL': { label: "Placeholder", color: 'bg-yellow-100 text-yellow-800' },
    'PAID': { label: "Placeholder", color: 'bg-green-100 text-green-800' }
  }

  const priorityConfig = {
    'low': { label: "Placeholder", color: 'bg-gray-100 text-gray-800' },
    'normal': { label: "Placeholder", color: 'bg-blue-100 text-blue-800' },
    'high': { label: "Placeholder", color: 'bg-red-100 text-red-800' }
  }

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < orders.length

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedOrders.length > 0) {
      onBulkAction(action, selectedOrders)
      setSelectedOrders([]) // Clear selection after action
    }
  }

  // Delete handler
  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (orderToDelete && onDeleteOrder) {
      onDeleteOrder(orderToDelete)
    }
    setShowDeleteDialog(false)
    setOrderToDelete(null)
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig] || paymentStatusConfig.UNPAID
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Using formatCurrency from useCurrency hook

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedOrders.length} {"Placeholder".toLowerCase()} {"Placeholder"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('confirm')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {"Placeholder"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              {"Placeholder"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('print')}
            >
              <Printer className="h-4 w-4 mr-2" />
              {"Placeholder"}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {"Placeholder"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                  <Archive className="h-4 w-4 mr-2" />
                  {"Placeholder"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('cancel')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {"Placeholder"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {"Placeholder"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedOrders([])}
            >
              {"Placeholder"}
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate
                  }}
                />
              </TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead>{"Placeholder"}</TableHead>
              <TableHead className="w-12">{"Placeholder"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{"Placeholder"}</p>
                  <p className="text-sm">{"Placeholder"}</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow 
                  key={order.id}
                  className={selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.order_no}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.order_items?.length || 0} item • {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} {"Placeholder".toLowerCase()}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.customer_name}</div>
                      {order.customer_phone && (
                        <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(order.status)}
                      {order.priority !== 'normal' && getPriorityBadge(order.priority)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{"Placeholder"}: {formatDate(order.order_date)}</div>
                      {order.delivery_date && (
                        <div className="text-muted-foreground">
                          {"Placeholder"}: {formatDate(order.delivery_date)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                      {getPaymentBadge(order.payment_status)}
                      {order.paid_amount > 0 && order.payment_status !== 'PAID' && (
                        <div className="text-xs text-muted-foreground">
                          {"Placeholder"}: {formatCurrency(order.paid_amount)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {"Placeholder"}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onEditOrder(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {"Placeholder"}
                        </DropdownMenuItem>
                        
                        
                        <DropdownMenuSeparator />
                        
                        {order.status === 'PENDING' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {"Placeholder"} {"Placeholder"}
                          </DropdownMenuItem>
                        )}
                        
                        {order.status === 'CONFIRMED' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'IN_PROGRESS')}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {"Placeholder"}
                          </DropdownMenuItem>
                        )}
                        
                        {order.status === 'IN_PROGRESS' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'READY')}>
                            <Package className="h-4 w-4 mr-2" />
                            {"Placeholder"}
                          </DropdownMenuItem>
                        )}
                        
                        {order.status === 'READY' && onUpdateStatus && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'DELIVERED')}>
                            <Truck className="h-4 w-4 mr-2" />
                            {"Placeholder"}
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {onDeleteOrder && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {"Placeholder"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesanan "{orderToDelete?.order_no}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default OrdersTable