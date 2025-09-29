'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { MobileInput, MobileSelect } from '@/components/ui/mobile-forms'

interface FinancialFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  dateFilter: string
  setDateFilter: (value: string) => void
  paymentMethodFilter: string
  setPaymentMethodFilter: (value: string) => void
  isMobile: boolean
  transactionTypes: any[]
  incomeCategories: string[]
  expenseCategories: string[]
}

/**
 * Financial filters component for searching and filtering transactions
 */
export function FinancialFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  dateFilter,
  setDateFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  isMobile,
  transactionTypes,
  incomeCategories,
  expenseCategories
}: FinancialFiltersProps) {
  return (
    <Card>
      <CardContent className={`pt-6 ${isMobile ? 'px-4' : ''}`}>
        <div className={`flex gap-4 ${
          isMobile ? 'flex-col space-y-4' : 'flex-col md:flex-row'
        }`}>
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute text-muted-foreground ${
                isMobile ? 'left-3 top-3 h-4 w-4' : 'left-2.5 top-2.5 h-4 w-4'
              }`} />
              {isMobile ? (
                <MobileInput
                  placeholder="Cari deskripsi atau referensi..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="pl-10"
                />
              ) : (
                <Input
                  placeholder="Cari deskripsi atau referensi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              )}
            </div>
          </div>
          <div className={`flex gap-2 ${
            isMobile ? 'flex-col space-y-2' : 'flex-wrap'
          }`}>
            {isMobile ? (
              <>
                <MobileSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="Semua Tipe"
                  options={[
                    { value: "Semua", label: "Semua Tipe" },
                    ...transactionTypes.map(type => ({
                      value: type.value,
                      label: type.label
                    }))
                  ]}
                />
                <MobileSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="Semua Kategori"
                  options={[
                    { value: "Semua", label: "Semua Kategori" },
                    ...[...incomeCategories, ...expenseCategories].map(category => ({
                      value: category,
                      label: category
                    }))
                  ]}
                />
                <MobileInput
                  value={dateFilter}
                  onChange={setDateFilter}
                  placeholder="Pilih tanggal"
                />
              </>
            ) : (
              <>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Semua Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Tipe</SelectItem>
                    {transactionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Kategori</SelectItem>
                    {[...incomeCategories, ...expenseCategories].map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40"
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
