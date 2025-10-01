'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MobileInput, MobileSelect } from '@/components/ui/mobile-forms'
import { useResponsive } from '@/hooks/use-responsive'

interface FinanceFormProps {
  onClose: () => void
}

/**
 * Finance form component for adding/editing transactions
 */
export function FinanceForm({ onClose }: FinanceFormProps) {
  const [selectedType, setSelectedType] = useState('INCOME')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [date, setDate] = useState('')
  const [reference, setReference] = useState('')
  const [description, setDescription] = useState('')

  const { isMobile } = useResponsive()

  const transactionTypes = [
    { value: 'INCOME', label: 'Pemasukan' },
    { value: 'EXPENSE', label: 'Pengeluaran' }
  ]

  const incomeCategories = ['Penjualan', 'Investasi', 'Lain-lain']
  const expenseCategories = ['Bahan Baku', 'Gaji', 'Operasional', 'Equipment', 'Marketing', 'Transport']
  const paymentMethods = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET']

  const getPaymentMethodLabel = (method: string) => {
    const methods: any = {
      'CASH': 'Tunai',
      'BANK_TRANSFER': 'Transfer Bank',
      'CREDIT_CARD': 'Kartu Kredit',
      'DIGITAL_WALLET': 'E-Wallet'
    }
    return methods[method] || method
  }

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      }`}>
        <div>
          <Label htmlFor="type">Tipe Transaksi</Label>
          {isMobile ? (
            <MobileSelect
              value={selectedType}
              onChange={setSelectedType}

              options={transactionTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          ) : (
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          {isMobile ? (
            <MobileSelect
              value={category}
              onChange={setCategory}

              options={(selectedType === 'INCOME' ? incomeCategories : expenseCategories).map(cat => ({
                value: cat,
                label: cat
              }))}
            />
          ) : (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(selectedType === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="amount">Jumlah</Label>
          {isMobile ? (
            <MobileInput
              value={amount}
              onChange={setAmount}

              type="number"
            />
          ) : (
            <Input
              id="amount"
              type="number"

              value={amount}
              onChange={(e) => setAmount}
            />
          )}
        </div>
        <div>
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          {isMobile ? (
            <MobileSelect
              value={paymentMethod}
              onChange={setPaymentMethod}

              options={paymentMethods.map(method => ({
                value: method,
                label: getPaymentMethodLabel(method)
              }))}
            />
          ) : (
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method} value={method}>{getPaymentMethodLabel(method)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="date">Tanggal</Label>
          {isMobile ? (
            <MobileInput
              value={date}
              onChange={setDate}

              type="date"
            />
          ) : (
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="reference">Referensi</Label>
          {isMobile ? (
            <MobileInput
              value={reference}
              onChange={setReference}

            />
          ) : (
            <Input
              id="reference"

              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        {isMobile ? (
          <MobileInput
            value={description}
            onChange={setDescription}

            multiline
            rows={3}
          />
        ) : (
          <Textarea
            id="description"

            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </div>
      <div className={`flex gap-2 pt-4 ${
        isMobile ? 'flex-col' : 'justify-end'
      }`}>
        <Button variant="outline" onClick={onClose} className={isMobile ? 'w-full' : ''}>
          Batal
        </Button>
        <Button className={isMobile ? 'w-full' : ''}>
          Simpan Transaksi
        </Button>
      </div>
    </div>
  )
}
