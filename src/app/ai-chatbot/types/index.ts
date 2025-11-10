export interface QuickAction {
  label: string
  action: 'navigate' | 'suggest'
  url?: string
  suggestion?: string
  icon?: string
}

export interface Message {
  id: string
  role: 'assistant' | 'user' | 'system'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: Record<string, unknown>
  quickActions?: QuickAction[]
  feedback?: {
    rating: number | null
    comment?: string
    timestamp?: Date
  }
}

export interface ChatSuggestion {
  text: string
  category: string
}

export interface ConversationTemplate {
  id: string
  title: string
  description: string
  icon: string
  category: string
  messages: string[]
  tags: string[]
}

export const SUGGESTIONS: ChatSuggestion[] = [
  { text: "Berapa stok bahan baku yang tersedia?", category: "inventory" },
  { text: "Rekomendasikan resep untuk hari ini", category: "recipe" },
  { text: "Analisis profit margin bulan ini", category: "financial" },
  { text: "Status pesanan terbaru", category: "orders" },
  { text: "Sarankan harga jual yang optimal", category: "pricing" },
  { text: "Prediksi penjualan minggu depan", category: "forecast" }
]

export const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  {
    id: 'inventory-check',
    title: 'Pengecekan Stok',
    description: 'Pantau dan kelola inventori bahan baku Anda',
    icon: '📦',
    category: 'inventory',
    tags: ['stok', 'bahan', 'inventori'],
    messages: [
      'Berapa stok bahan baku yang tersedia saat ini?',
      'Apakah ada bahan yang stoknya hampir habis?',
      'Berikan rekomendasi bahan apa yang perlu dibeli minggu ini'
    ]
  },
  {
    id: 'sales-analysis',
    title: 'Analisis Penjualan',
    description: 'Pelajari performa penjualan dan tren bisnis',
    icon: '📊',
    category: 'orders',
    tags: ['penjualan', 'analisis', 'tren'],
    messages: [
      'Bagaimana performa penjualan bulan ini?',
      'Produk mana yang paling laris?',
      'Apakah ada pola penjualan yang bisa saya analisis?'
    ]
  },
  {
    id: 'profit-optimization',
    title: 'Optimasi Profit',
    description: 'Tingkatkan keuntungan dengan analisis HPP dan harga',
    icon: '💰',
    category: 'financial',
    tags: ['profit', 'hpp', 'harga'],
    messages: [
      'Berapa profit margin rata-rata produk saya?',
      'Bagaimana cara menurunkan HPP tanpa mengurangi kualitas?',
      'Sarankan harga jual yang optimal untuk produk terlaris'
    ]
  },
  {
    id: 'menu-planning',
    title: 'Perencanaan Menu',
    description: 'Rencanakan menu harian berdasarkan stok dan tren',
    icon: '👨‍🍳',
    category: 'recipes',
    tags: ['menu', 'resep', 'perencanaan'],
    messages: [
      'Rekomendasikan resep untuk hari ini berdasarkan stok bahan',
      'Produk mana yang perlu diprioritaskan produksinya?',
      'Bagaimana cara diversifikasi menu tanpa menambah bahan baru?'
    ]
  },
  {
    id: 'forecast-planning',
    title: 'Perencanaan & Prediksi',
    description: 'Prediksi penjualan dan rencanakan bisnis ke depan',
    icon: '🔮',
    category: 'forecast',
    tags: ['prediksi', 'perencanaan', 'bisnis'],
    messages: [
      'Prediksi penjualan minggu depan berdasarkan data historis',
      'Kapan waktu terbaik untuk restock bahan baku?',
      'Apakah saya perlu menambah kapasitas produksi?'
    ]
  },
  {
    id: 'pricing-strategy',
    title: 'Strategi Harga',
    description: 'Optimalkan strategi penetapan harga produk',
    icon: '🏷️',
    category: 'pricing',
    tags: ['harga', 'strategi', 'kompetitor'],
    messages: [
      'Bagaimana cara menentukan harga jual yang kompetitif?',
      'Apakah harga produk saya sudah optimal?',
      'Sarankan strategi harga untuk produk baru'
    ]
  }
]
