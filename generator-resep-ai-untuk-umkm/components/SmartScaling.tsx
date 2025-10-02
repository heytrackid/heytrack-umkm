import React, { useState } from 'react';
import { Recipe } from '../types';

interface SmartScalingProps {
  recipe: Recipe;
  onScaledRecipe: (scaledRecipe: Recipe, scaleFactor: number) => void;
}

const SmartScaling: React.FC<SmartScalingProps> = ({ recipe, onScaledRecipe }) => {
  const [targetServings, setTargetServings] = useState<number>(recipe.servings || 2);
  const [isScaling, setIsScaling] = useState(false);

  // Calculate scaling factor
  const originalServings = recipe.servings || 2;
  const scaleFactor = targetServings / originalServings;

  const scaleIngredient = (ingredient: string): string => {
    // Simple ingredient scaling - in production, you'd want more sophisticated parsing
    const quantityMatch = ingredient.match(/^(\d+(?:\.\d+)?)\s*(.+)/);

    if (quantityMatch) {
      const [, quantity, rest] = quantityMatch;
      const scaledQuantity = parseFloat(quantity) * scaleFactor;

      // Round to reasonable precision
      const roundedQuantity = scaledQuantity >= 1
        ? Math.round(scaledQuantity * 100) / 100
        : Math.round(scaledQuantity * 1000) / 1000;

      return `${roundedQuantity} ${rest}`;
    }

    return ingredient; // Return as-is if no quantity found
  };

  const handleScaleRecipe = () => {
    setIsScaling(true);

    // Create scaled recipe
    const scaledRecipe: Recipe = {
      ...recipe,
      name: `${recipe.name} (${targetServings} Porsi)`,
      servings: targetServings,
      ingredients: recipe.ingredients.map(scaleIngredient),
      nutrition: {
        calories: recipe.nutrition.calories ? `${Math.round(parseFloat(recipe.nutrition.calories) * scaleFactor)}` : recipe.nutrition.calories,
        protein: recipe.nutrition.protein ? `${Math.round(parseFloat(recipe.nutrition.protein) * scaleFactor)}` : recipe.nutrition.protein,
        carbs: recipe.nutrition.carbs ? `${Math.round(parseFloat(recipe.nutrition.carbs) * scaleFactor)}` : recipe.nutrition.carbs,
        fat: recipe.nutrition.fat ? `${Math.round(parseFloat(recipe.nutrition.fat) * scaleFactor)}` : recipe.nutrition.fat,
      }
    };

    // Simulate processing time
    setTimeout(() => {
      onScaledRecipe(scaledRecipe, scaleFactor);
      setIsScaling(false);
    }, 1000);
  };

  const getScalingRecommendation = () => {
    if (targetServings <= 2) return "Porsi kecil - cocok untuk personal";
    if (targetServings <= 4) return "Porsi sedang - cocok untuk keluarga kecil";
    if (targetServings <= 8) return "Porsi besar - cocok untuk keluarga besar atau acara";
    return "Porsi sangat besar - cocok untuk catering atau event besar";
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-green-300 inline-block" style={{fontFamily: "'Inter', sans-serif"}}>
        📏 Smart Recipe Scaling
      </h3>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Sesuaikan resep "{recipe.name}" untuk jumlah porsi yang Anda inginkan.
        Semua bahan akan otomatis di-scale sesuai perhitungan.
      </p>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porsi Asli
            </label>
            <div className="text-lg font-semibold text-green-600">
              {originalServings} orang
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porsi Target
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={targetServings}
              onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">Faktor Scaling:</span>
            <span className="text-lg font-bold text-green-600">{scaleFactor.toFixed(2)}x</span>
          </div>
          <p className="text-xs text-green-700 mt-1">{getScalingRecommendation()}</p>
        </div>

        <button
          onClick={handleScaleRecipe}
          disabled={isScaling || targetServings === originalServings}
          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
        >
          {isScaling ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Menghitung scaling...
            </div>
          ) : targetServings === originalServings ? (
            'Porsi sudah sesuai'
          ) : (
            `Scale ke ${targetServings} Porsi`
          )}
        </button>
      </div>

      {scaleFactor !== 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Catatan Scaling</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Bahan akan di-scale secara otomatis berdasarkan perhitungan matematis</li>
            <li>• Nilai nutrisi dihitung berdasarkan total porsi baru</li>
            <li>• Untuk hasil terbaik, pertimbangkan waktu memasak yang mungkin berbeda</li>
            <li>• Beberapa bahan mungkin perlu penyesuaian manual untuk tekstur optimal</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartScaling;
