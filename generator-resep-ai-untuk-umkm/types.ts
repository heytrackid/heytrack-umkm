

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs:string;
  fat: string;
}

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: NutritionInfo;
  servings?: number; // Jumlah porsi yang bisa dibuat
}

export interface MarketingStrategy {
  summary: string;
  targetAudience: {
    personaName: string;
    demographics: string;
    psychographics: string;
  };
  usp: string;
  contentPillars: string[];
  branding: {
    logoConcept: string;
    slogan: string;
    packaging: string;
    toneOfVoice: string;
  };
  socialMedia: {
    platform: 'Instagram' | 'TikTok' | 'Facebook' | 'X (Twitter)';
    strategySummary: string;
    contentIdeas: {
      title: string;
      format: string;
      description: string;
    }[];
  }[];
  offlineStrategy: string[];
  promotions: {
    promotionName: string;
    description: string;
    objective: string;
  }[];
  kpis: string[];
}

export interface HppResult {
  hppPerPortion: string;
  suggestedPrices: {
    level: 'Ekonomis' | 'Standar' | 'Premium';
    price: string;
    justification: string;
  }[];
}

// These are simplified schemas for OpenRouter responses
// OpenRouter doesn't support schema enforcement like Gemini, so we'll validate manually
export const NUTRITION_SCHEMA = {
  type: 'object',
  properties: {
    calories: { type: 'string', description: "Total kalori, contoh: '550 kkal'" },
    protein: { type: 'string', description: "Total protein dalam gram, contoh: '30g'" },
    carbs: { type: 'string', description: "Total karbohidrat dalam gram, contoh: '45g'" },
    fat: { type: 'string', description: "Total lemak dalam gram, contoh: '25g'" },
  },
  required: ['calories', 'protein', 'carbs', 'fat'],
};

export const RECIPE_SCHEMA = {
    type: 'object',
    properties: {
      name: { type: 'string', description: "Nama kreatif dari resep." },
      description: { type: 'string', description: "Deskripsi singkat yang menggugah selera tentang hidangan tersebut." },
      ingredients: {
        type: 'array',
        items: { type: 'string' },
        description: "Daftar bahan-bahan dengan takaran yang tepat."
      },
      instructions: {
        type: 'array',
        items: { type: 'string' },
        description: "Instruksi langkah-demi-langkah untuk menyiapkan resep."
      },
      servings: { type: 'number', description: "Jumlah porsi yang bisa dibuat dari resep ini, contoh: 4" },
      nutrition: NUTRITION_SCHEMA,
    },
    required: ['name', 'description', 'ingredients', 'instructions', 'servings', 'nutrition'],
};

export const MARKETING_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: "Ringkasan eksekutif 2-3 kalimat dari keseluruhan strategi yang diusukan." },
    targetAudience: {
      type: 'object',
      description: "Profil target audiens yang detail.",
      properties: {
        personaName: { type: 'string', description: "Nama persona yang representatif untuk target audiens, contoh: 'Gen-Z Pencari Kafe Estetik'." },
        demographics: { type: 'string', description: "Deskripsi demografis: usia, pekerjaan, lokasi, dll." },
        psychographics: { type: 'string', description: "Deskripsi psikografis: gaya hidup, nilai, hobi, pain points." },
      },
      required: ['personaName', 'demographics', 'psychographics'],
    },
    usp: { type: 'string', description: "Unique Selling Proposition (USP) produk dalam satu kalimat yang kuat dan menarik." },
    contentPillars: {
      type: 'array',
      items: { type: 'string' },
      description: "3 pilar konten utama sebagai fondasi tema komunikasi. Contoh: 'Edukasi Kopi', 'Suasana Kafe', 'Promosi Spesial'."
    },
    branding: {
      type: 'object',
      description: "Elemen-elemen inti dari identitas brand.",
      properties: {
        logoConcept: { type: 'string', description: "Ide konsep singkat untuk desain logo." },
        slogan: { type: 'string', description: "Slogan yang menarik dan mudah diingat." },
        packaging: { type: 'string', description: "Saran ide untuk kemasan produk." },
        toneOfVoice: { type: 'string', description: "Gaya bahasa dan kepribadian brand. Contoh: 'Ramah & Santai', 'Modern & Berkelas'." },
      },
      required: ['logoConcept', 'slogan', 'packaging', 'toneOfVoice'],
    },
    socialMedia: {
      type: 'array',
      description: "Strategi untuk 2 platform media sosial yang paling relevan.",
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string', description: "Nama platform media sosial (Contoh: Instagram, TikTok)." },
          strategySummary: { type: 'string', description: "Ringkasan strategi 1-2 kalimat untuk platform ini." },
          contentIdeas: {
            type: 'array',
            description: "3 ide konten konkret untuk platform ini.",
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', description: "Judul ide konten yang menarik." },
                format: { type: 'string', description: "Format konten (Contoh: Reels, Carousel, TikTok Video, Story)." },
                description: { type: 'string', description: "Deskripsi singkat tentang ide konten tersebut." },
              },
              required: ['title', 'format', 'description'],
            }
          }
        },
        required: ['platform', 'strategySummary', 'contentIdeas'],
      },
    },
    offlineStrategy: {
      type: 'array',
      items: { type: 'string' },
      description: "2-3 ide strategi pemasaran offline yang relevan. Contoh: 'Kolaborasi dengan komunitas lokal', 'Menjadi sponsor acara kampus'."
    },
    promotions: {
      type: 'array',
      description: "3 ide promosi yang terstruktur.",
      items: {
        type: 'object',
        properties: {
          promotionName: { type: 'string', description: "Nama program promosi. Contoh: 'Promo Gajian Ceria'." },
          description: { type: 'string', description: "Mekanisme detail dari promosi tersebut." },
          objective: { type: 'string', description: "Tujuan utama dari promosi ini. Contoh: 'Meningkatkan traffic di hari kerja'." },
        },
        required: ['promotionName', 'description', 'objective'],
      },
    },
    kpis: {
        type: 'array',
        items: { type: 'string' },
        description: "3-4 Key Performance Indicators (KPIs) utama untuk mengukur keberhasilan strategi. Contoh: 'Peningkatan Pengikut Media Sosial 20% dalam 3 bulan', 'Mendapatkan 50 pelanggan baru dari promo'."
    }
  },
  required: ['summary', 'targetAudience', 'usp', 'contentPillars', 'branding', 'socialMedia', 'offlineStrategy', 'promotions', 'kpis'],
};

export const HPP_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    hppPerPortion: { type: 'string', description: "Harga Pokok Produksi (HPP) per porsi, contoh: 'Rp 8.500'" },
    suggestedPrices: {
      type: 'array',
      description: "Tiga opsi harga jual yang disarankan.",
      items: {
        type: 'object',
        properties: {
          level: { type: 'string', description: "Level harga, contoh: 'Ekonomis', 'Standar', 'Premium'." },
          price: { type: 'string', description: "Harga jual yang disarankan, contoh: 'Rp 15.000'" },
          justification: { type: 'string', description: "Alasan atau justifikasi singkat untuk harga yang disarankan." },
        },
        required: ['level', 'price', 'justification'],
      }
    }
  },
  required: ['hppPerPortion', 'suggestedPrices'],
};