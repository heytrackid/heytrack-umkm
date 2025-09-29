'use client'

import React, { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { OrdersPage as ModularOrdersPage, OrdersTableView } from '@/modules/orders'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

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

        {/* Header */}
        <div className="flex items-center justify-end">
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
