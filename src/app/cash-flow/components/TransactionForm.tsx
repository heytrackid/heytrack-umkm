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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FinancialRecordSchema, type ExpenseForm } from '@/lib/validations/form-validations'
import { incomeCategories, expenseCategories } from '../constants'

interface TransactionFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transactionType: 'income' | 'expense'
  onTransactionTypeChange: (type: 'income' | 'expense') => void
  onSubmit: (data: ExpenseForm) => void
  loading: boolean
}

export default function TransactionForm({
  isOpen,
  onOpenChange,
  transactionType,
  onTransactionTypeChange,
  onSubmit,
  loading
}: TransactionFormProps) {
  const form = useForm<ExpenseForm>({
    resolver: zodResolver(FinancialRecordSchema),
    defaultValues: {
      amount: 0,
      category: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'CASH',
      is_recurring: false
    }
  })

  const categories = transactionType === 'income' ? incomeCategories : expenseCategories

  const handleTransactionTypeChange = (value: 'income' | 'expense') => {
    onTransactionTypeChange(value)
    form.setValue('category', '')
  }

  const handleSubmit = (data: ExpenseForm) => {
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
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
              value={form.watch('category')}
              onValueChange={(value) => form.setValue('category', value)}
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
            {form.formState.errors.category && (
              <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              {...form.register('description')}
              placeholder="Contoh: Pembelian tepung terigu 10kg"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Jumlah (Rp)</Label>
            <Input
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="0"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              {...form.register('expense_date')}
            />
            {form.formState.errors.expense_date && (
              <p className="text-sm text-red-600">{form.formState.errors.expense_date.message}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
