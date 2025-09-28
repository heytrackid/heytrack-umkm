import EnhancedHPPCalculator from '@/modules/recipes/components/EnhancedHPPCalculator'
import AppLayout from '@/components/layout/app-layout'

export const metadata = {
  title: 'Kalkulator HPP Pintar - HeyTrack UMKM',
  description: 'Hitung Harga Pokok Produksi dengan weighted average cost untuk profit yang stabil',
}

export default function HPPEnhancedRoute() {
  return (
    <AppLayout>
      <EnhancedHPPCalculator />
    </AppLayout>
  )
}