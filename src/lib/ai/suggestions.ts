/**
 * AI Suggestions utility functions
 * Provides contextual suggestions based on user intent
 */

export function generateAISuggestions(intent: string): string[] {
  switch (intent) {
    case 'check_inventory':
      return [
        "Berapa stok tepung terigu yang tersisa?",
        "Bahan apa saja yang perlu direstock?",
        "Tips mengoptimalkan stok bahan baku"
      ]
    case 'analyze_hpp':
      return [
        "Bagaimana cara menghitung HPP brownies?",
        "Faktor apa yang mempengaruhi HPP?",
        "Tips menurunkan biaya produksi"
      ]
    case 'analyze_profit':
      return [
        "Produk mana yang paling menguntungkan?",
        "Bagaimana cara meningkatkan profit margin?",
        "Analisis keuntungan bulan ini"
      ]
    case 'recipe_query':
      return [
        "Resep apa yang cocok untuk hari ini?",
        "Bagaimana optimasi resep untuk profit?",
        "Tips manajemen resep yang efisien"
      ]
    case 'pricing_strategy':
      return [
        "Berapa harga jual yang optimal?",
        "Strategi pricing untuk produk baru",
        "Cara menentukan margin yang sehat"
      ]
    case 'marketing_strategy':
      return [
        "Tips marketing untuk UMKM kuliner",
        "Strategi promosi yang efektif",
        "Cara meningkatkan penjualan online"
      ]
    default:
      return [
        "Berapa stok bahan baku yang tersedia?",
        "Rekomendasikan resep untuk hari ini",
        "Analisis profit margin bulan ini",
        "Status pesanan terbaru"
      ]
  }
}