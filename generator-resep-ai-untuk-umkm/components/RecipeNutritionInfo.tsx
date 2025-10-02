import React from 'react';
import { Recipe } from '../types';

interface RecipeNutritionInfoProps {
  recipe: Recipe;
}

const RecipeNutritionInfo: React.FC<RecipeNutritionInfoProps> = ({ recipe }) => {
  const servings = recipe.servings || 4; // Default 4 porsi jika tidak ada

  // Hitung estimasi jumlah pcs/item yang bisa dibuat berdasarkan jenis makanan
  const estimatePcs = (recipeName: string, servings: number): string => {
    const name = recipeName.toLowerCase();

    // Bakery & Roti
    if (name.includes('croissant') || name.includes('danish') || name.includes('brioche')) {
      return `${servings * 6} pcs`; // 6 pcs per loyang
    }
    if (name.includes('donut') || name.includes('cinnamon roll') || name.includes('muffin') || name.includes('scone')) {
      return `${servings * 8} pcs`; // 8 pcs per loyang
    }
    if (name.includes('roti tawar') || name.includes('baguette') || name.includes('ciabatta')) {
      return `${servings} loaf`; // 1 loaf per resep
    }
    if (name.includes('bagel')) {
      return `${servings * 6} pcs`; // 6 bagels per resep
    }
    if (name.includes('bread') || name.includes('focaccia')) {
      return `${servings} loaf`; // 1 loaf
    }

    // Minuman Kopi & Teh
    if (name.includes('espresso') || name.includes('americano') || name.includes('macchiato')) {
      return `${servings * 2} gelas`; // 2 gelas per porsi (double shot)
    }
    if (name.includes('latte') || name.includes('cappuccino') || name.includes('mocha') || name.includes('flat white')) {
      return `${servings * 2} gelas`; // 2 gelas per porsi
    }
    if (name.includes('cold brew') || name.includes('iced coffee') || name.includes('frappuccino')) {
      return `${servings * 3} gelas`; // 3 gelas per porsi (iced drinks)
    }
    if (name.includes('tea latte') || name.includes('matcha')) {
      return `${servings * 2} gelas`; // 2 gelas per porsi
    }
    if (name.includes('tea') && !name.includes('latte')) {
      return `${servings * 4} gelas`; // 4 gelas per porsi (hot tea)
    }

    // Makanan Cafe
    if (name.includes('sandwich') || name.includes('panini') || name.includes('toast')) {
      return `${servings} pcs`; // 1 pcs per porsi
    }
    if (name.includes('burrito') || name.includes('wrap')) {
      return `${servings} pcs`; // 1 pcs per porsi
    }
    if (name.includes('quiche') || name.includes('frittata')) {
      return `${Math.ceil(servings / 8)} pie`; // 1 pie untuk 8 porsi
    }
    if (name.includes('pasta') || name.includes('risotto')) {
      return `${servings} porsi`; // Sudah dalam bentuk porsi
    }

    // Dessert Cafe
    if (name.includes('macaron') || name.includes('madeleine') || name.includes('eclair')) {
      return `${servings * 12} pcs`; // 12 pcs per resep
    }
    if (name.includes('tiramisu') || name.includes('panna cotta') || name.includes('creme brulee')) {
      return `${servings * 6} porsi`; // 6 porsi per resep
    }
    if (name.includes('tart') || name.includes(' crumble')) {
      return `${servings} tart`; // 1 tart per resep
    }
    if (name.includes('cannoli') || name.includes('profiterole')) {
      return `${servings * 8} pcs`; // 8 pcs per resep
    }

    // Default dari kategori sebelumnya
    if (name.includes('nugget') || name.includes('chicken finger')) {
      return `${servings * 4} pcs`; // 4 pcs per porsi
    }
    if (name.includes('burger') || name.includes('pizza')) {
      return `${servings} pcs`; // 1 pcs per porsi
    }
    if (name.includes('sate')) {
      return `${servings * 5} tusuk`; // 5 tusuk per porsi
    }
    if (name.includes('bakso') || name.includes('mie')) {
      return `${servings} porsi`; // Sudah dalam bentuk porsi
    }
    if (name.includes('cake') || name.includes('kue')) {
      return `${servings} loyang`; // 1 loyang per porsi
    }
    if (name.includes('risol') || name.includes('lumpia')) {
      return `${servings * 6} pcs`; // 6 pcs per porsi
    }
    if (name.includes('es') || name.includes('jus') || name.includes('minuman')) {
      return `${servings * 4} gelas`; // 4 gelas per porsi
    }

    return `${servings} porsi`; // Default
  };

  const nutritionData = [
    {
      label: 'Kalori',
      value: recipe.nutrition.calories,
      icon: '🔥',
      description: 'Energi total per porsi'
    },
    {
      label: 'Protein',
      value: recipe.nutrition.protein,
      icon: '💪',
      description: 'Pembentukan otot & jaringan'
    },
    {
      label: 'Karbohidrat',
      value: recipe.nutrition.carbs,
      icon: '🌾',
      description: 'Sumber energi utama'
    },
    {
      label: 'Lemak',
      value: recipe.nutrition.fat,
      icon: '🥑',
      description: 'Asam lemak esensial'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Serving Information */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>
              📊 Informasi Porsi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Jumlah Porsi</p>
                <p className="text-xl font-bold text-blue-600">{servings} orang</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Estimasi Pcs/Item</p>
                <p className="text-xl font-bold text-blue-600">{estimatePcs(recipe.name, servings)}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm text-blue-700">Per Porsi</p>
          </div>
        </div>
      </div>

      {/* Detailed Nutrition Facts */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
          🥗 Fakta Nutrisi Detail
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {nutritionData.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nutrition Notes */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">💡 Tips Nutrisi:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Informasi nutrisi bersifat perkiraan berdasarkan bahan umum</li>
            <li>• Nilai sebenarnya dapat bervariasi tergantung bahan spesifik yang digunakan</li>
            <li>• Konsultasikan dengan ahli gizi untuk informasi yang lebih akurat</li>
            <li>• Sesuaikan porsi berdasarkan kebutuhan kalori harian Anda</li>
          </ul>
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
          💼 Insight Bisnis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-purple-800 mb-1">Target Market</h4>
            <p className="text-sm text-gray-600">
              {servings <= 2 ? 'Personal/Individual' :
               servings <= 4 ? 'Keluarga Kecil' :
               servings <= 8 ? 'Keluarga Besar/Event' : 'Catering/Restoran'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
            <div className="text-2xl mb-2">📦</div>
            <h4 className="font-semibold text-purple-800 mb-1">Packaging</h4>
            <p className="text-sm text-gray-600">
              {estimatePcs(recipe.name, servings).includes('pcs') ||
               estimatePcs(recipe.name, servings).includes('tusuk') ? 'Takeaway boxes' :
               estimatePcs(recipe.name, servings).includes('gelas') ? 'Disposable cups' :
               'Food containers'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
            <div className="text-2xl mb-2">⏰</div>
            <h4 className="font-semibold text-purple-800 mb-1">Prep Time</h4>
            <p className="text-sm text-gray-600">
              {recipe.instructions.length <= 5 ? '15-30 menit' :
               recipe.instructions.length <= 10 ? '30-60 menit' : '60+ menit'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeNutritionInfo;
