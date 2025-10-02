import React, { useState } from 'react';
import { Recipe } from '../types';
import { RECIPE_VARIATIONS } from '../constants';
import { generateRecipe } from '../services/openrouterService';
import { validateRecipeCategory, rateLimiter } from '../lib/security';
import LoadingSpinner from './LoadingSpinner';

interface RecipeVariationsProps {
  baseRecipe: Recipe;
  onVariationSelect: (recipe: Recipe) => void;
}

const RecipeVariations: React.FC<RecipeVariationsProps> = ({ baseRecipe, onVariationSelect }) => {
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [generatedVariations, setGeneratedVariations] = useState<{[key: string]: Recipe}>({});
  const [isGenerating, setIsGenerating] = useState<{[key: string]: boolean}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleGenerateVariation = async (variationType: string) => {
    if (isGenerating[variationType]) return;

    // Rate limiting
    const sessionId = 'user-session';
    if (!rateLimiter.isAllowed(sessionId, 5, 60000)) {
      setErrors(prev => ({ ...prev, [variationType]: 'Terlalu banyak permintaan. Silakan tunggu sebentar.' }));
      return;
    }

    setIsGenerating(prev => ({ ...prev, [variationType]: true }));
    setErrors(prev => ({ ...prev, [variationType]: '' }));

    try {
      const variationPrompt = `${baseRecipe.name} - ${variationType}`;

      // Validate the variation prompt
      const validatedPrompt = validateRecipeCategory(variationPrompt);

      const variationRecipe = await generateRecipe(validatedPrompt);

      setGeneratedVariations(prev => ({ ...prev, [variationType]: variationRecipe }));
      setSelectedVariations(prev => [...prev, variationType]);
    } catch (error) {
      console.error(`Error generating ${variationType}:`, error);
      setErrors(prev => ({
        ...prev,
        [variationType]: error instanceof Error ? error.message : 'Gagal generate variasi resep'
      }));
    } finally {
      setIsGenerating(prev => ({ ...prev, [variationType]: false }));
    }
  };

  const getVariationIcon = (variationType: string) => {
    switch (variationType) {
      case 'Spicy Version':
        return '🌶️';
      case 'Healthy Version':
        return '🥗';
      case 'Budget Version':
        return '💰';
      case 'Family Size':
        return '👨‍👩‍👧‍👦';
      case 'Quick Version':
        return '⚡';
      default:
        return '🍽️';
    }
  };

  const getVariationDescription = (variationType: string) => {
    switch (variationType) {
      case 'Spicy Version':
        return 'Versi pedas dengan tambahan cabai dan rempah';
      case 'Healthy Version':
        return 'Versi sehat dengan lebih banyak sayuran dan nutrisi';
      case 'Budget Version':
        return 'Versi ekonomis dengan bahan pengganti yang murah';
      case 'Family Size':
        return 'Versi untuk 6-8 orang, porsi besar';
      case 'Quick Version':
        return 'Versi cepat masak, under 30 menit';
      default:
        return 'Variasi resep alternatif';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-blue-300 inline-block" style={{fontFamily: "'Inter', sans-serif"}}>
        ✨ Recipe Variations
      </h3>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Generate berbagai variasi dari resep "{baseRecipe.name}" untuk menambah pilihan menu Anda.
      </p>

      <div className="grid gap-4">
        {RECIPE_VARIATIONS.map((variationType) => (
          <div key={variationType} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getVariationIcon(variationType)}</span>
                <div>
                  <h4 className="font-semibold text-slate-800">{variationType}</h4>
                  <p className="text-sm text-gray-600">{getVariationDescription(variationType)}</p>
                </div>
              </div>

              {!selectedVariations.includes(variationType) ? (
                <button
                  onClick={() => handleGenerateVariation(variationType)}
                  disabled={isGenerating[variationType]}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm font-medium"
                >
                  {isGenerating[variationType] ? (
                    <div className="flex items-center">
                      <LoadingSpinner />
                      <span className="ml-2">Generating...</span>
                    </div>
                  ) : (
                    'Generate'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => generatedVariations[variationType] && onVariationSelect(generatedVariations[variationType])}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                >
                  ✓ Pilih
                </button>
              )}
            </div>

            {errors[variationType] && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                {errors[variationType]}
              </div>
            )}

            {generatedVariations[variationType] && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">
                  ✅ {generatedVariations[variationType].name}
                </p>
                <p className="text-sm text-green-700">
                  {generatedVariations[variationType].description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedVariations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Tip: Pilih salah satu variasi untuk melihat detail resep lengkapnya
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeVariations;
