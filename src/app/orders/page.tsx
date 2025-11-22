'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { OrdersPage as OrdersPageComponent } from '@/modules/orders/components/OrdersPage/index'

const OrdersPage = () => (
  <AppLayout>
    <OrdersPageComponent />
  </AppLayout>
)

export default OrdersPage