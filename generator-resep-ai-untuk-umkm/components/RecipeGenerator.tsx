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
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('');
  const [selectedSpecificCategory, setSelectedSpecificCategory] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

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
        const newImages = await generateRecipeImages(newRecipe.name);
        setImages(newImages);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setShowCustomInput(true);
      setSelectedSpecificCategory('');
    } else {
      setSelectedSpecificCategory(category);
      setShowCustomInput(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Recipe Generator Form */}
        {!recipe && !isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>
                🍳 Generator Resep AI
              </h2>
              <p className="text-gray-600 text-lg">
                Pilih kategori atau ketik ide resep Anda untuk membuat resep otomatis
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Category Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
                  📂 Pilih Kategori
                </h3>

                <div className="space-y-4">
                  {/* Category Group Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Masakan
                    </label>
                    <select
                      value={selectedCategoryGroup}
                      onChange={(e) => {
                        setSelectedCategoryGroup(e.target.value);
                        setSelectedSpecificCategory('');
                        setShowCustomInput(false);
                        setCustomInput('');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Pilih jenis masakan...</option>
                      {Object.keys(RECIPE_CATEGORIES_GROUPED).map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specific Category Dropdown or Custom Input */}
                  {selectedCategoryGroup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Resep <span className="text-xs text-gray-500">(atau pilih "Tulis Resep Sendiri")</span>
                      </label>
                      {!showCustomInput ? (
                        <select
                          value={selectedSpecificCategory}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          disabled={isLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                        >
                          <option value="">Pilih resep spesifik...</option>
                          {RECIPE_CATEGORIES_GROUPED[selectedCategoryGroup].map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                          <option value="custom" className="font-medium text-orange-600">
                            ──────────────────
                          </option>
                          <option value="custom" className="font-medium text-orange-600">
                            ✏️  Tulis Resep Sendiri
                          </option>
                        </select>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-orange-600">✏️ Resep Custom:</span>
                            <button
                              onClick={() => {
                                setShowCustomInput(false);
                                setCustomInput('');
                              }}
                              className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                              Kembali ke dropdown
                            </button>
                          </div>
                          <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder={`Contoh: ${RECIPE_CATEGORIES_GROUPED[selectedCategoryGroup][0]} spesial...`}
                            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            disabled={isLoading}
                          />
                          <button
                            onClick={() => handleCustomInput({ preventDefault: () => {} } as React.FormEvent)}
                            disabled={isLoading || !customInput.trim()}
                            className="w-full px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Buat Resep AI
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Random Button */}
                  <button
                    onClick={handleRandomGenerate}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                      </svg>
                      Acak Resep
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
                  🎨 Ide Kustom
                </h3>

                <form onSubmit={handleCustomInput} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ketik ide resep Anda
                    </label>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Contoh: Ayam goreng crispy, Nasi liwet khas Solo, Smoothie bowl sehat..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !customInput.trim()}
                    className="w-full px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Membuat Resep...' : 'Buat Resep AI'}
                  </button>
                </form>

                {/* Quick Examples */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-3">Ide cepat:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Ayam bakar madu",
                      "Sate ayam bumbu kacang",
                      "Nasi uduk betawi",
                      "Croissant isi coklat",
                      "Latte klasik",
                      "Club sandwich",
                      "Tiramisu"
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setCustomInput(example)}
                        disabled={isLoading}
                        className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full transition-colors duration-200 disabled:opacity-50"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-3 mt-1">
                    💡
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tidak menemukan resep yang sesuai?</p>
                    <p>Pilih jenis masakan terlebih dahulu, lalu pilih <strong>"✏️ Tulis Resep Sendiri"</strong> dari dropdown untuk membuat resep custom!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-white to-orange-50 rounded-2xl border border-orange-200 shadow-lg">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 rounded-full mb-6 shadow-lg">
                <LoadingSpinner />
              </div>
              <p className="text-xl font-bold text-slate-800 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>Sedang membuat resep lezat untuk Anda...</p>
              <p className="text-gray-600 text-lg">Mohon tunggu sebentar. Makanan enak butuh waktu!</p>
              {recipe && <p className="mt-4 text-sm text-orange-600 bg-orange-100 px-4 py-2 rounded-full inline-block">Sekarang sedang menyiapkan foto-foto indah untuk "{recipe.name}"...</p>}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
            <h3 className="font-bold text-lg">Oops! Terjadi kesalahan.</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Recipe Result */}
        {recipe && !isLoading && (
          <RecipeCard
            recipe={recipe}
            images={images}
            onCalculateHpp={handleCalculateHpp}
            hppResult={hppResult}
            isCalculatingHpp={isCalculatingHpp}
            hppError={hppError}
            onVariationSelect={(selectedRecipe) => {
              setRecipe(selectedRecipe);
              setImages([]); // Reset images, will be regenerated
              setHppResult(null);
              setHppError(null);
            }}
            onScaledRecipe={(scaledRecipe, scaleFactor) => {
              setRecipe(scaledRecipe);
              setImages([]); // Reset images for scaled recipe
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
