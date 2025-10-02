import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Recipe, HppResult } from '../types';
import { RECIPE_CATEGORIES_GROUPED } from '../constants';
import { generateRecipe, generateRecipeImages, calculateHpp } from '../services/openrouterService';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';

const RecipeGenerator = forwardRef((props, ref) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('');

  const [hppResult, setHppResult] = useState<HppResult | null>(null);
  const [isCalculatingHpp, setIsCalculatingHpp] = useState<boolean>(false);
  const [hppError, setHppError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    handleGenerateRecipe,
    handleRandomGenerate
  }));

  const handleGenerateRecipe = useCallback(async (category: string) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setImages([]);
    setHppResult(null);
    setHppError(null);
    setSelectedCategory(category);

    try {
      const newRecipe = await generateRecipe(category);
      setRecipe(newRecipe);

      if (newRecipe && newRecipe.name) {
        const newImages = await generateRecipeImages(newRecipe.name, brandName);
        setImages(newImages);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [brandName]);

  const handleRandomGenerate = useCallback(() => {
    // Get all categories from grouped categories
    const allCategories = Object.values(RECIPE_CATEGORIES_GROUPED).flat();
    const randomIndex = Math.floor(Math.random() * allCategories.length);
    const randomCategory = allCategories[randomIndex];
    handleGenerateRecipe(randomCategory);
  }, [handleGenerateRecipe]);

  const handleCustomInput = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleGenerateRecipe(customInput.trim());
      setCustomInput('');
    }
  }, [customInput, handleGenerateRecipe]);

  const handleCategorySelect = useCallback((category: string) => {
    if (category === 'custom') {
      // Custom input is now always visible, no need for state
    } else {
      handleGenerateRecipe(category);
    }
  }, [handleGenerateRecipe]);

  const handleCalculateHpp = useCallback(async (ingredientCosts: { [key: string]: string }) => {
    if (!recipe) return;

    setIsCalculatingHpp(true);
    setHppError(null);
    setHppResult(null);

    try {
      const result = await calculateHpp(recipe, ingredientCosts);
      setHppResult(result);
    } catch (err) {
      console.error(err);
      setHppError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghitung HPP.');
    } finally {
      setIsCalculatingHpp(false);
    }
  }, [recipe]);

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Recipe Generator Form */}
        {!recipe && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Apa resep yang ingin Anda buat hari ini?
              </h2>
              <p className="text-gray-600">
                Ceritakan ide resep Anda atau pilih dari inspirasi berikut
              </p>
            </div>
            <div className="mb-8">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nama Brand (Opsional) 💼
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Misal: Warung Makan Bu Siti, Kedai Kopi Aroma..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Nama brand akan muncul sebagai watermark di foto-foto produk yang dihasilkan
                </p>
              </div>
            </div>

            {/* Main Input - Most Prominent */}
            <div className="mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ketik ide resep Anda:
                  </label>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Misal: Ayam goreng crispy, Nasi liwet khas Solo, Es kopi susu..."
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => handleCustomInput({ preventDefault: () => {} })}
                  disabled={isLoading || !customInput.trim()}
                  className="w-full px-6 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isLoading ? 'Sedang membuat resep...' : 'Buat Resep AI'}
                </button>
              </div>
            </div>

            {/* Quick Inspiration */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Inspirasi untuk bisnis kuliner Anda:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { name: "Ayam Geprek", desc: "Trending dan mudah dijual" },
                  { name: "Nasi Gudeg", desc: "Makanan tradisional yang hits" },
                  { name: "Es Kopi Susu", desc: "Minuman kekinian" },
                  { name: "Martabak Mini", desc: "Snack populer di kafe" },
                  { name: "Bakso Bakar", desc: "Variasi bakso modern" },
                  { name: "Pisang Nugget", desc: "Snack sehat dan unik" }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleGenerateRecipe(item.name)}
                    disabled={isLoading}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Random Option */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={handleRandomGenerate}
                  disabled={isLoading}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  🎲 Beri saya resep acak
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Biarkan AI pilih resep menarik untuk bisnis Anda
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-200 rounded-lg">
            <div className="bg-gray-100 p-4 rounded-full mb-6">
              <LoadingSpinner />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              Sedang membuat resep...
            </p>
            <p className="text-gray-600">
              Mohon tunggu sebentar
            </p>
            {recipe && (
              <p className="mt-4 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                Menyiapkan foto untuk "{recipe.name}"
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-8 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Terjadi kesalahan</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setRecipe(null);
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Recipe Result */}
        {recipe && !isLoading && (
          <RecipeCard
            recipe={recipe}
            images={images}
            brandName={brandName}
            onCalculateHpp={handleCalculateHpp}
            hppResult={hppResult}
            isCalculatingHpp={isCalculatingHpp}
            hppError={hppError}
            onVariationSelect={(selectedRecipe) => {
              setRecipe(selectedRecipe);
              setImages([]);
              setHppResult(null);
              setHppError(null);
            }}
            onScaledRecipe={(scaledRecipe, scaleFactor) => {
              setRecipe(scaledRecipe);
              setImages([]);
              setHppResult(null);
              setHppError(null);
            }}
          />
        )}
      </div>
    </>
  );
});

export default RecipeGenerator;
