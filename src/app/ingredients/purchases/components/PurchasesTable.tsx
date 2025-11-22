import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/table-skeleton'

import type { IngredientPurchase } from '@/app/ingredients/purchases/components/types'

// Purchases Table Component - Lazy Loaded
// Displays ingredient purchase history in a table


interface PurchasesTableProps {
  purchases: IngredientPurchase[]
  isLoading?: boolean
}

const PurchasesTable = ({ purchases, isLoading = false }: PurchasesTableProps): JSX.Element => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={6} />
        </CardContent>
      </Card>
    )
  }

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
                <TableHead className="bg-muted/50">Tanggal</TableHead>
                <TableHead className="bg-muted/50">Bahan Baku</TableHead>
                <TableHead className="bg-muted/50">Supplier</TableHead>
                <TableHead className="bg-muted/50 text-right">Jumlah</TableHead>
                <TableHead className="bg-muted/50 text-right">Harga Satuan</TableHead>
                <TableHead className="bg-muted/50 text-right">Total</TableHead>
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
                  <TableRow key={purchase['id']}>
                    <TableCell>
                      {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.ingredient?.name ?? '-'}</div>
                        {purchase.notes && (
                          <div className="text-xs text-muted-foreground">{purchase.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof purchase.supplier === 'string' 
                        ? purchase.supplier 
                        : purchase.supplier?.name ?? '-'}
                    </TableCell>
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

export { PurchasesTable }
