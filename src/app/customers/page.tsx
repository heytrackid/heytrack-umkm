// Customers Page - Code Split Version
// This page now uses lazy-loaded components for better performance

import { CustomersLayout } from '@/app/customers/components/CustomersLayout'
import { AppLayout } from '@/components/layout/app-layout'

const CustomersPage = (): JSX.Element => (
  <AppLayout pageTitle="Pelanggan">
    <CustomersLayout />
  </AppLayout>
)

export default CustomersPage
