import { HelpCircle } from "lucide-react"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface TooltipHelperProps {
    content: string
    children?: React.ReactNode
    showIcon?: boolean
    side?: "bottom" | "left" | "right" | "top"
    className?: string
}

/**
 * Helper component untuk menampilkan tooltip dengan icon bantuan
 * Digunakan untuk menjelaskan istilah teknis ke bahasa yang mudah dimengerti UMKM
 */
export const TooltipHelper = ({
    content,
    children,
    showIcon = true,
    side = "top",
    className = ""
}: TooltipHelperProps) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
                    {children}
                    {showIcon && (
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                </span>
            </TooltipTrigger>
            <TooltipContent side={side} className="max-w-xs text-sm">
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
)

/**
 * Wrapper untuk label dengan tooltip
 */
export const LabelWithTooltip = ({
    label,
    tooltip,
    required = false,
    className = ""
}: {
    label: string
    tooltip: string
    required?: boolean
    className?: string
}) => (
    <label className={`text-sm font-medium flex items-center gap-1 ${className}`}>
        {label}
        {required && <span className="text-destructive">*</span>}
        <TooltipHelper content={tooltip} />
    </label>
)

/**
 * Kamus istilah teknis ke bahasa UMKM
 */
export const UMKM_TOOLTIPS = {
    // HPP & Costing
    hpp: "Harga Pokok Produksi - Total biaya yang dikeluarkan untuk membuat 1 produk (bahan baku + tenaga kerja + biaya operasional)",
    wac: "Weighted Average Cost - Harga rata-rata bahan baku berdasarkan pembelian terakhir. Digunakan untuk menghitung HPP yang lebih akurat",
    margin: "Keuntungan - Selisih antara harga jual dengan biaya produksi. Contoh: Jual Rp 50.000, HPP Rp 30.000, maka margin Rp 20.000 (40%)",
    cogs: "Cost of Goods Sold - Total biaya bahan baku yang dipakai untuk produksi",

    // Inventory
    stock: "Stok - Jumlah bahan baku atau produk yang tersedia di gudang",
    reorderPoint: "Titik Pesan Ulang - Jumlah stok minimum yang memicu peringatan untuk pesan ulang ke supplier",
    minStock: "Stok Minimum - Jumlah stok terendah yang harus selalu tersedia untuk menghindari kehabisan",
    leadTime: "Waktu Tunggu - Berapa hari supplier butuh waktu untuk mengirim pesanan setelah dipesan",

    // Orders
    orderStatus: "Status Pesanan - Tahapan pesanan: Pending (menunggu), In Progress (sedang dikerjakan), Ready (siap), Delivered (sudah dikirim)",
    paymentStatus: "Status Pembayaran - Apakah pesanan sudah dibayar: Unpaid (belum bayar), Partial (bayar sebagian), Paid (lunas)",
    priority: "Prioritas - Tingkat kepentingan pesanan: Low (biasa), Normal (standar), High (penting/mendesak)",

    // Production
    batchSize: "Ukuran Batch - Jumlah produk yang dibuat dalam 1 kali produksi",
    yield: "Hasil Produksi - Jumlah produk jadi yang dihasilkan dari 1 resep",

    // Financial
    revenue: "Pendapatan - Total uang yang masuk dari penjualan",
    expense: "Pengeluaran - Total uang yang keluar untuk operasional bisnis",
    profit: "Keuntungan Bersih - Pendapatan dikurangi semua pengeluaran",
    cashFlow: "Arus Kas - Pergerakan uang masuk dan keluar dari bisnis",

    // Recipe
    servings: "Porsi - Jumlah porsi yang dihasilkan dari 1 resep",
    prepTime: "Waktu Persiapan - Berapa lama waktu yang dibutuhkan untuk menyiapkan bahan",
    cookTime: "Waktu Memasak - Berapa lama waktu yang dibutuhkan untuk memasak",

    // Customer
    loyaltyPoints: "Poin Loyalitas - Poin reward untuk pelanggan setia yang bisa ditukar dengan diskon",
    customerType: "Tipe Pelanggan - Kategori pelanggan: New (baru), Regular (langganan), VIP (pelanggan istimewa)",

    // Reports
    roi: "Return on Investment - Perbandingan keuntungan dengan modal yang dikeluarkan. Contoh: Modal Rp 1 juta, untung Rp 300 ribu = ROI 30%",
    breakeven: "Titik Impas - Jumlah penjualan minimum untuk menutupi semua biaya (tidak untung tidak rugi)",
}
