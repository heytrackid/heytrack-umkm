'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { OrdersPage as ModularOrdersPage, OrdersTableView } from '@/modules/orders'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart, MessageCircle } from 'lucide-react'

export default function OrdersPageWrapper() {
  const [useTableView, setUseTableView] = useState(false)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Pesanan</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with New Order Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Daftar Pesanan
            </h1>
            <p className="text-muted-foreground">
              Kelola semua pesanan dan penjualan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/settings/whatsapp-templates'}
              className="hidden sm:flex"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Templates WA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseTableView(!useTableView)}
            >
              {useTableView ? 'Card View' : 'Table View'}
            </Button>
            <Button asChild>
              <Link href="/orders/new">
                <Plus className="h-4 w-4 mr-2" />
                Pesanan Baru
              </Link>
            </Button>
          </div>
        </div>

        {useTableView ? (
          <OrdersTableView />
        ) : (
          <ModularOrdersPage userRole="manager" enableAdvancedFeatures={true} />
        )}
      </div>
    </AppLayout>
  )
}
