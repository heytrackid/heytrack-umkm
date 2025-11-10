'use client'

import { Receipt, ArrowUpCircle, ArrowDownCircle, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

import type { Transaction } from '@/app/cash-flow/constants'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'

interface EnhancedTransactionListProps {
    transactions: Transaction[]
    onDeleteTransaction: (transaction: Transaction) => void
    formatCurrency: (amount: number) => string
    loading: boolean
}

type FilterType = 'all' | 'expense' | 'income'
type SortBy = 'amount-asc' | 'amount-desc' | 'date-asc' | 'date-desc'

const ITEMS_PER_PAGE = 10

const EnhancedTransactionList = ({
    transactions,
    onDeleteTransaction,
    formatCurrency,
    loading
}: EnhancedTransactionListProps): JSX.Element => {
    const [filterType, setFilterType] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortBy>('date-desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

    // Filter, search, and sort transactions
    const processedTransactions = useMemo(() => {
        let result = [...transactions]

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(t => t['type'] === filterType)
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(t =>
                t.description.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            )
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                case 'amount-desc':
                    return b.amount - a.amount
                case 'amount-asc':
                    return a.amount - b.amount
                default:
                    return 0
            }
        })

        return result
    }, [transactions, filterType, searchQuery, sortBy])

    // Pagination
    const totalPages = Math.ceil(processedTransactions.length / ITEMS_PER_PAGE)
    const effectivePage = Math.min(currentPage, totalPages || 1)
    const paginatedTransactions = processedTransactions.slice(
        (effectivePage - 1) * ITEMS_PER_PAGE,
        effectivePage * ITEMS_PER_PAGE
    )

    const handleDeleteClick = (transaction: Transaction): void => {
        setTransactionToDelete(transaction)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = (): void => {
        if (transactionToDelete) {
            onDeleteTransaction(transactionToDelete)
            setDeleteDialogOpen(false)
            setTransactionToDelete(null)
        }
    }



    const filterOptions = [
        { value: 'all' as FilterType, label: 'Semua', count: transactions.length },
        {
            value: 'income' as FilterType,
            label: 'Pemasukan',
            count: transactions.filter(t => t['type'] === 'income').length
        },
        {
            value: 'expense' as FilterType,
            label: 'Pengeluaran',
            count: transactions.filter(t => t['type'] === 'expense').length
        }
    ]

    const sortOptions = [
        { value: 'date-desc' as SortBy, label: 'Terbaru' },
        { value: 'date-asc' as SortBy, label: 'Terlama' },
        { value: 'amount-desc' as SortBy, label: 'Jumlah Tertinggi' },
        { value: 'amount-asc' as SortBy, label: 'Jumlah Terendah' }
    ]

    return (
        <>
            <Card id="transaction-list">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Riwayat Transaksi</CardTitle>
                            <CardDescription>
                                {processedTransactions.length} dari {transactions.length} transaksi
                            </CardDescription>
                        </div>

                    </div>

                    {/* Filters and Search */}
                    <div className="space-y-3 pt-4">
                        {/* Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map(option => (
                                <Button
                                    key={option.value}
                                    variant={filterType === option.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterType(option.value)}
                                    className="gap-2"
                                >
                                    {option.value === 'income' && <ArrowUpCircle className="h-3 w-3" />}
                                    {option.value === 'expense' && <ArrowDownCircle className="h-3 w-3" />}
                                    {option.value === 'all' && <Filter className="h-3 w-3" />}
                                    {option.label}
                                    <Badge variant="secondary" className="ml-1">
                                        {option.count}
                                    </Badge>
                                </Button>
                            ))}
                        </div>

                        {/* Search and Sort */}
                        <div className="flex gap-2 flex-col sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari deskripsi atau kategori..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {paginatedTransactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            {transactions.length === 0 ? (
                                <>
                                    <p className="font-medium mb-1">Belum ada transaksi di periode ini</p>
                                    <p className="text-sm">Klik &quot;Tambah Transaksi&quot; untuk memulai</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium mb-1">Tidak ada transaksi yang cocok</p>
                                    <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {paginatedTransactions.map((transaction, index) => (
                                    <div
                                        key={`${transaction['id']}-${index}`}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${transaction['type'] === 'income'
                                                ? 'bg-gray-100 dark:bg-gray-900'
                                                : 'bg-red-100 dark:bg-red-900'
                                                }`}>
                                                {transaction['type'] === 'income' ? (
                                                    <ArrowUpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                ) : (
                                                    <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-wrap-mobile">{transaction.description}</p>
                                                <div className="flex gap-2 items-center text-xs text-muted-foreground flex-wrap mt-1">
                                                    <span>
                                                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span>•</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {transaction.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <p className={`text-base md:text-lg font-semibold ${transaction['type'] === 'income' ? 'text-gray-600' : 'text-red-600'
                                                }`}>
                                                {transaction['type'] === 'income' ? '+' : '-'}
                                                {formatCurrency(Math.abs(transaction.amount))}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(transaction)}
                                                disabled={loading}
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Halaman {currentPage} dari {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda yakin ingin menghapus transaksi ini?
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                                <p className="font-medium">{transactionToDelete?.description}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {transactionToDelete && formatCurrency(transactionToDelete.amount)}
                                </p>
                            </div>
                            <p className="mt-3 text-sm">
                                Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi laporan keuangan Anda.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export { EnhancedTransactionList }