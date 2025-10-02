import React, { useState, useCallback } from 'react';
import { Recipe, HppResult } from '../types';
import { RECIPE_CATEGORIES } from '../constants';
import { generateRecipe, generateRecipeImages, calculateHpp } from '../services/openrouterService';
import CategorySelector from './CategorySelector';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';

const WelcomePlaceholder: React.FC = () => (
  <div className="text-center p-12 bg-gradient-to-br from-white to-orange-50 rounded-2xl border-2 border-dashed border-orange-200 shadow-inner">
    <div className="mx-auto bg-gradient-to-r from-orange-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M5 3a2 2 0 012-2h10a2 2 0 012 2v1h-14V3z" />
        <path fillRule="evenodd" d="M5 6h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2V6zm2 2a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M10 15v4a2 2 0 002 2h0a2 2 0 002-2v-4" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>Selamat Datang di Generator Resep AI!</h2>
    <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
      Siap untuk berkreasi? Pilih kategori makanan, ketik ide resep Anda, atau coba resep acak untuk inspirasi.
    </p>
    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
        <div className="text-orange-500 mb-2">🍳</div>
        <h3 className="font-semibold text-slate-800 mb-1">Kategori Cepat</h3>
        <p className="text-sm text-gray-600">Pilih dari berbagai kategori makanan populer</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
        <div className="text-orange-500 mb-2">✨</div>
        <h3 className="font-semibold text-slate-800 mb-1">Ide Kreatif</h3>
        <p className="text-sm text-gray-600">Masukan ide unik Anda untuk resep custom</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
        <div className="text-orange-500 mb-2">🎲</div>
        <h3 className="font-semibold text-slate-800 mb-1">Random Surprise</h3>
        <p className="text-sm text-gray-600">Biarkan AI memilih resep menarik untuk Anda</p>
      </div>
    </div>
  </div>
);

const RecipeGenerator: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hppResult, setHppResult] = useState<HppResult | null>(null);
  const [isCalculatingHpp, setIsCalculatingHpp] = useState<boolean>(false);
  const [hppError, setHppError] = useState<string | null>(null);

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
    const randomIndex = Math.floor(Math.random() * RECIPE_CATEGORIES.length);
    const randomCategory = RECIPE_CATEGORIES[randomIndex];
    handleGenerateRecipe(randomCategory);
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
      <CategorySelector
        categories={RECIPE_CATEGORIES}
        onSelectCategory={handleGenerateRecipe}
        onRandomGenerate={handleRandomGenerate}
        isLoading={isLoading}
      />

      <div className="mt-8">
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
        {error && (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
            <h3 className="font-bold text-lg">Oops! Terjadi kesalahan.</h3>
            <p>{error}</p>
          </div>
        )}
        {!isLoading && recipe && (
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
        {!isLoading && !recipe && !error && (
           <WelcomePlaceholder />
        )}
      </div>
    </>
  );
};

export default RecipeGenerator;
