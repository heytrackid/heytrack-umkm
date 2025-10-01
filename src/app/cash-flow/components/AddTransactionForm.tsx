'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

interface Transaction {
  type: 'income' | 'expense'
  description: string
  category: string
  amount: string
  date: string
}

interface AddTransactionFormProps {
  transaction: Transaction
  onTransactionChange: (transaction: Transaction) => void
  onBack: () => void
  onSubmit: () => void
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

/**
 * Add Transaction Form Component
 * Extracted from cash-flow/page.tsx for code splitting
 */
export default function AddTransactionForm({
  transaction,
  onTransactionChange,
  onBack,
  onSubmit,
  formatCurrency,
  isMobile = false
}: AddTransactionFormProps) {
  const incomeCategories = [
    'Penjualan Produk',
    'Penjualan Katering',
    'Pendapatan Lainnya'
  ]

  const expenseCategories = [
    'Pembelian Bahan Baku',
    'Gaji Karyawan',
    'Sewa Tempat',
    'Utilitas (Listrik, Air, Gas)',
    'Peralatan',
    'Marketing',
    'Transport & Logistik',
    'Biaya Operasional Lainnya'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Tambah Transaksi
          </h2>
          <p className="text-muted-foreground">Catat pemasukan atau pengeluaran</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <Select
              value={transaction.type}
              onValueChange={(value: 'income' | 'expense') =>
                onTransactionChange({ ...transaction, type: value, category: '' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={transaction.category}
              onValueChange={(value) =>
                onTransactionChange({ ...transaction, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(transaction.type === 'income'
                  ? incomeCategories
                  : expenseCategories
                ).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              value={transaction.description}
              onChange={(e) =>
                onTransactionChange({ ...transaction, description: e.target.value })
              }

              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={transaction.amount}
                onChange={(e) =>
                  onTransactionChange({ ...transaction, amount: e.target.value })
                }

              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={transaction.date}
                onChange={(e) =>
                  onTransactionChange({ ...transaction, date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSubmit} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan Transaksi
            </Button>
            <Button variant="outline" onClick={onBack}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
