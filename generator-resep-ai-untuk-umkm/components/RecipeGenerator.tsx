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
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-12 border-b border-gray-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-sm">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
                  🍳 Generator Resep AI
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Pilih kategori atau ketik ide resep Anda untuk membuat resep otomatis
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Category Selection */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>
                      📂 Pilih Kategori
                    </h3>
                    <p className="text-gray-600">Temukan resep dari berbagai kategori yang tersedia</p>
                  </div>

                  <div className="space-y-6">
                    {/* Category Group Dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                        className="w-full px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Pilih Resep <span className="text-sm text-gray-500">(atau pilih "Tulis Resep Sendiri")</span>
                        </label>
                        {!showCustomInput ? (
                          <select
                            value={selectedSpecificCategory}
                            onChange={(e) => handleCategorySelect(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 transition-colors duration-200"
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
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                              <span className="text-sm font-medium text-orange-900">✏️ Resep Custom:</span>
                              <button
                                onClick={() => {
                                  setShowCustomInput(false);
                                  setCustomInput('');
                                }}
                                className="text-sm text-orange-600 hover:text-orange-800 underline font-medium"
                              >
                                Kembali ke dropdown
                              </button>
                            </div>
                            <input
                              type="text"
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              placeholder={`Contoh: ${RECIPE_CATEGORIES_GROUPED[selectedCategoryGroup][0]} spesial...`}
                              className="w-full px-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-white border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              disabled={isLoading}
                            />
                            <button
                              onClick={() => handleCustomInput({ preventDefault: () => {} } as React.FormEvent)}
                              disabled={isLoading || !customInput.trim()}
                              className="w-full px-6 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                              🚀 Buat Resep AI
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Random Button */}
                    <button
                      onClick={handleRandomGenerate}
                      disabled={isLoading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                        </svg>
                        Acak Resep
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Input */}
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>
                      🎨 Ide Kustom
                    </h3>
                    <p className="text-gray-600">Ingin resep yang unik? Tulis ide Anda sendiri</p>
                  </div>

                  <form onSubmit={handleCustomInput} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Ketik ide resep Anda
                      </label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Contoh: Ayam goreng crispy, Nasi liwet khas Solo, Smoothie bowl sehat..."
                        className="w-full px-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-colors duration-200"
                        rows={6}
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !customInput.trim()}
                      className="w-full px-6 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {isLoading ? 'Membuat Resep...' : '🚀 Buat Resep AI'}
                    </button>
                  </form>

                  {/* Quick Examples */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-4">💡 Ide cepat:</p>
                    <div className="flex flex-wrap gap-3">
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
                          className="px-4 py-2 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 hover:border-orange-300 hover:shadow-sm"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-4 mt-1">
                    💡
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-2">Tidak menemukan resep yang sesuai?</p>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Pilih jenis masakan terlebih dahulu, lalu pilih <strong>"✏️ Tulis Resep Sendiri"</strong> dari dropdown untuk membuat resep custom!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-white to-orange-50 rounded-2xl border border-orange-200">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 rounded-full mb-6">
                <LoadingSpinner />
              </div>
              <p className="text-xl font-bold text-slate-800 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>Sedang membuat resep lezat untuk Anda...</p>
              <p className="text-gray-600 text-lg">Mohon tunggu sebentar. Makanan enak butuh waktu!</p>
              {recipe && <p className="mt-4 text-sm text-orange-600 bg-orange-100 px-4 py-2 rounded-full inline-block">Sekarang sedang menyiapkan foto-foto indah untuk "{recipe.name}"...</p>}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
