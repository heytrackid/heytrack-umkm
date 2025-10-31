// Purchases Table Component - Lazy Loaded
// Displays ingredient purchase history in a table

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { IngredientPurchase } from './types'

interface PurchasesTableProps {
  purchases: IngredientPurchase[]
}

const PurchasesTable = ({ purchases }: PurchasesTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Pembelian</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Bahan Baku</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Belum ada data pembelian
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      {new Date(purchase.purchase_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.ingredient?.name || '-'}</div>
                        {purchase.notes && (
                          <div className="text-xs text-muted-foreground">{purchase.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{purchase.supplier || '-'}</TableCell>
                    <TableCell className="text-right">
                      {purchase.quantity} {purchase.ingredient?.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {purchase.unit_price?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {purchase.total_price?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default PurchasesTable
