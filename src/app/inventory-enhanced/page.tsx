import EnhancedInventoryPage from '@/modules/inventory/components/EnhancedInventoryPage'

export const metadata = {
  title: 'Inventory & Harga Rata-rata - HeyTrack UMKM',
  description: 'Kelola inventory dengan weighted average cost calculation untuk HPP yang akurat',
}

export default function InventoryEnhancedRoute() {
  return <EnhancedInventoryPage />
}