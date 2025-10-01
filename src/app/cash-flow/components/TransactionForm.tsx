import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { incomeCategories, expenseCategories, type TransactionFormData } from '../constants'

interface TransactionFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transactionType: 'income' | 'expense'
  onTransactionTypeChange: (type: 'income' | 'expense') => void
  formData: TransactionFormData
  onFormDataChange: (data: TransactionFormData) => void
  onSubmit: () => void
  loading: boolean
}

export default function TransactionForm({
  isOpen,
  onOpenChange,
  transactionType,
  onTransactionTypeChange,
  formData,
  onFormDataChange,
  onSubmit,
  loading
}: TransactionFormProps) {
  const categories = transactionType === 'income' ? incomeCategories : expenseCategories

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  const handleTransactionTypeChange = (value: 'income' | 'expense') => {
    onTransactionTypeChange(value)
    // Reset category when type changes
    onFormDataChange({
      ...formData,
      category: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <Select
              value={transactionType}
              onValueChange={handleTransactionTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    Pemasukan
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    Pengeluaran
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              placeholder="Contoh: Pembelian tepung terigu 10kg"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Jumlah (Rp)</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
