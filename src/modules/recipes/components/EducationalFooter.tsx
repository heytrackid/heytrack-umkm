'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'





/**
 * Educational footer cards component for UMKM guidance
 */
export const EducationalFooter = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border/20 bg-muted">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">💡 Tips Penetapan Harga untuk UMKM</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs space-y-2">
          <p><strong>Margin 25-30%:</strong> Untuk produk harian seperti roti, kue kering</p>
          <p><strong>Margin 35-50%:</strong> Untuk produk premium, custom cake, wedding cake</p>
          <p><strong>Selalu cek kompetitor:</strong> Jangan terlalu jauh dari harga pasar</p>
          <p><strong>Review rutin:</strong> Minimal sebulan sekali, atau saat harga bahan naik</p>
        </CardContent>
      </Card>

      <Card className="border-border/20 bg-muted">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">🎯 Cara Pakai Hasil HPP</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs space-y-2">
          <p><strong>Harga Retail:</strong> Langsung pakai harga jual saran</p>
          <p><strong>Harga Grosir:</strong> HPP + margin 15-20% saja</p>
          <p><strong>Harga Reseller:</strong> HPP + margin 10-15%</p>
          <p><strong>Promo/Diskon:</strong> Jangan di bawah HPP, minimal HPP + 5%</p>
        </CardContent>
      </Card>
    </div>
  )


