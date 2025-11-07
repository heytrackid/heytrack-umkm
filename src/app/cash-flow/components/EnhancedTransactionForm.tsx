'use client'

import { ArrowUpCircle, ArrowDownCircle, AlertCircle, Loader2, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { SwipeableTabs, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
// SwipeableTabsContent not used in this component
import { Textarea } from '@/components/ui/textarea'

import { incomeCategories, expenseCategories, type TransactionFormData } from '../constants'

interface EnhancedTransactionFormProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    transactionType: 'expense' | 'income'
    onTransactionTypeChange: (type: 'expense' | 'income') => void
    onSubmit: (formData: TransactionFormData) => Promise<void>
    loading: boolean
}

const EnhancedTransactionForm = ({
    isOpen,
    onOpenChange,
    transactionType,
    onTransactionTypeChange,
    onSubmit,
    loading
}: EnhancedTransactionFormProps): JSX.Element => {
    const [formData, setFormData] = useState<TransactionFormData>({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0] ?? ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                description: '',
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0] ?? ''
            })
            setErrors({})
            setTouched({})
        }
    }, [isOpen])

    // Validate field
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'description':
                if (!value.trim()) { return 'Deskripsi wajib diisi' }
                if (value.length < 3) { return 'Deskripsi minimal 3 karakter' }
                if (value.length > 200) { return 'Deskripsi maksimal 200 karakter' }
                return ''

            case 'category':
                if (!value) { return 'Kategori wajib dipilih' }
                return ''

            case 'amount':
                {
                    if (!value) { return 'Jumlah wajib diisi' }
                    const amount = parseFloat(value)
                    if (isNaN(amount)) { return 'Jumlah harus berupa angka' }
                    if (amount <= 0) { return 'Jumlah harus lebih dari 0' }
                    if (amount > 1000000000) { return 'Jumlah terlalu besar' }
                    return ''
                }

            case 'date':
                {
                    if (!value) { return 'Tanggal wajib diisi' }
                    const selectedDate = new Date(value)
                    const today = new Date()
                    today.setHours(23, 59, 59, 999)
                    if (selectedDate > today) { return 'Tanggal tidak boleh di masa depan' }
                    return ''
                }

            default:
                return ''
        }
    }

    // Handle field change
    const handleFieldChange = (name: string, value: string): void => {
        setFormData(prev => ({ ...prev, [name]: value }))

        // Validate on change if field was touched
        if (touched[name]) {
            const error = validateField(name, value)
            setErrors(prev => ({ ...prev, [name]: error }))
        }
    }

    // Handle field blur
    const handleFieldBlur = (name: string): void => {
        setTouched(prev => ({ ...prev, [name]: true }))
        const error = validateField(name, formData[name as keyof TransactionFormData])
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    // Validate all fields
    const validateAll = (): boolean => {
        const newErrors: Record<string, string> = {}
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof TransactionFormData])
            if (error) { newErrors[key] = error }
        })
        setErrors(newErrors)
        setTouched({
            description: true,
            category: true,
            amount: true,
            date: true
        })
        return Object.keys(newErrors).length === 0
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()

        if (!validateAll()) {
            return
        }

        await onSubmit(formData)
    }

    const categories = transactionType === 'income' ? incomeCategories : expenseCategories

    // Format currency input
    const formatCurrencyInput = (value: string) => {
        const number = parseFloat(value.replace(/[^0-9]/g, ''))
        if (isNaN(number)) { return '' }
        return number.toLocaleString('id-ID')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-wrap-mobile">
                        {transactionType === 'income' ? (
                            <>
                                <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg flex-shrink-0">
                                    <ArrowUpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                Tambah Pemasukan
                            </>
                        ) : (
                            <>
                                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg flex-shrink-0">
                                    <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                Tambah Pengeluaran
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Catat transaksi {transactionType === 'income' ? 'pemasukan' : 'pengeluaran'} untuk melacak arus kas bisnis Anda
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    {/* Transaction Type Tabs */}
                    <SwipeableTabs
                        value={transactionType}
                        onValueChange={(value) => onTransactionTypeChange(value as 'expense' | 'income')}
                        className="mb-4"
                    >
                        <SwipeableTabsList className="grid w-full grid-cols-2">
                            <SwipeableTabsTrigger value="income" className="gap-2">
                                <ArrowUpCircle className="h-4 w-4" />
                                Pemasukan
                            </SwipeableTabsTrigger>
                            <SwipeableTabsTrigger value="expense" className="gap-2">
                                <ArrowDownCircle className="h-4 w-4" />
                                Pengeluaran
                            </SwipeableTabsTrigger>
                        </SwipeableTabsList>
                    </SwipeableTabs>

                    <div className="space-y-4">
                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Deskripsi <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder={
                                    transactionType === 'income'
                                        ? 'Contoh: Penjualan kue untuk acara pernikahan'
                                        : 'Contoh: Pembelian tepung terigu 10kg'
                                }
                                value={formData.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                onBlur={() => handleFieldBlur('description')}
                                className={errors['description'] && touched['description'] ? 'border-red-500' : ''}
                                rows={3}
                            />
                            {errors['description'] && touched['description'] && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors['description']}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formData.description.length}/200 karakter
                            </p>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Kategori <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleFieldChange('category', value)}
                            >
                                <SelectTrigger
                                    id="category"
                                    className={errors['category'] && touched['category'] ? 'border-red-500' : ''}
                                    onBlur={() => handleFieldBlur('category')}
                                >
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors['category'] && touched['category'] && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors['category']}
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">
                                Jumlah (Rp) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    Rp
                                </span>
                                <Input
                                    id="amount"
                                    type="text"
                                    placeholder="0"
                                    value={formData.amount ? formatCurrencyInput(formData.amount) : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '')
                                        handleFieldChange('amount', value)
                                    }}
                                    onBlur={() => handleFieldBlur('amount')}
                                    className={`pl-10 text-right ${errors['amount'] && touched['amount'] ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors['amount'] && touched['amount'] && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors['amount']}
                                </p>
                            )}
                            {formData.amount && !errors['amount'] && (
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrencyInput(formData.amount)} Rupiah
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date">
                                Tanggal <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleFieldChange('date', e.target.value)}
                                    onBlur={() => handleFieldBlur('date')}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={`pl-10 ${errors['date'] && touched['date'] ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors['date'] && touched['date'] && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors['date']}
                                </p>
                            )}
                        </div>

                        {/* Info Alert */}
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                Transaksi ini akan otomatis tercatat dalam laporan arus kas dan mempengaruhi perhitungan keuangan Anda.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || Object.keys(errors).some(key => errors[key])}
                            className={transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    {transactionType === 'income' ? (
                                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                                    ) : (
                                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Simpan Transaksi
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EnhancedTransactionForm
