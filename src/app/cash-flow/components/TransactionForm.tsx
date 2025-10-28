import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
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
import { ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FinancialRecordSchema, type ExpenseForm } from '@/lib/validations/form-validations'
import { incomeCategories, expenseCategories } from '@/app/cash-flow/constants'

import { Card } from '@/components/ui/card'

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
  const [currentBalance] = useState(5000000) // Mock - should come from props
  const [estimatedBalance, setEstimatedBalance] = useState(currentBalance)

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(FinancialRecordSchema),
    defaultValues: {
      type: transactionType === 'income' ? 'INCOME' : 'EXPENSE',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'CASH'
    }
  })

  const categories = transactionType === 'income' ? incomeCategories : expenseCategories
  const watchAmount = form.watch('amount')

  // Calculate estimated balance
  useEffect(() => {
    const amount = Number(watchAmount) || 0
    if (transactionType === 'income') {
      setEstimatedBalance(currentBalance + amount)
    } else {
      setEstimatedBalance(currentBalance - amount)
    }
  }, [watchAmount, transactionType, currentBalance])

  const handleTransactionTypeChange = (value: 'income' | 'expense') => {
    onTransactionTypeChange(value)
    form.setValue('category', '')
    form.setValue('type', value === 'income' ? 'INCOME' : 'EXPENSE')
  }

  const handleSubmit = (data: ExpenseForm) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
          <DialogDescription>
            Catat pemasukan atau pengeluaran bisnis Anda
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          {/* Transaction Type - Large Radio Buttons */}
          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`p-4 cursor-pointer transition-all ${transactionType === 'income'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'hover:border-muted-foreground/50'
                  }`}
                onClick={() => handleTransactionTypeChange('income')}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <ArrowUpCircle className={`h-8 w-8 ${transactionType === 'income' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={`font-medium ${transactionType === 'income' ? 'text-green-700 dark:text-green-400' : ''}`}>
                    Pemasukan
                  </span>
                </div>
              </Card>
              <Card
                className={`p-4 cursor-pointer transition-all ${transactionType === 'expense'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'hover:border-muted-foreground/50'
                  }`}
                onClick={() => handleTransactionTypeChange('expense')}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <ArrowDownCircle className={`h-8 w-8 ${transactionType === 'expense' ? 'text-red-600' : 'text-muted-foreground'}`} />
                  <span className={`font-medium ${transactionType === 'expense' ? 'text-red-700 dark:text-red-400' : ''}`}>
                    Pengeluaran
                  </span>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jumlah (Rp)</Label>
            <Input
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="0"
              className="text-lg"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
            {/* Balance Preview */}
            {watchAmount > 0 && (
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Saldo akan menjadi{' '}
                  <span className={`font-semibold ${estimatedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {estimatedBalance.toLocaleString('id-ID')}
                  </span>
                </span>
              </div>
            )}
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
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
