export interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: Record<string, unknown> | unknown[] | boolean | number | string | null
}

export interface ChatSuggestion {
  text: string
  category: string
}

export const SUGGESTIONS: ChatSuggestion[] = [
  { text: "Berapa stok bahan baku yang tersedia?", category: "inventory" },
  { text: "Rekomendasikan resep untuk hari ini", category: "recipe" },
  { text: "Analisis profit margin bulan ini", category: "financial" },
  { text: "Status pesanan terbaru", category: "orders" },
  { text: "Sarankan harga jual yang optimal", category: "pricing" },
  { text: "Prediksi penjualan minggu depan", category: "forecast" }
]
