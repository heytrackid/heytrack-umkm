import React, { useState, useCallback } from 'react';
import { Recipe, HppResult } from '../types';
import { RECIPE_CATEGORIES } from '../constants';
import { generateRecipe, generateRecipeImages, calculateHpp } from '../services/openrouterService';
import CategorySelector from './CategorySelector';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';

const WelcomePlaceholder: React.FC = () => (
  <div className="text-center p-6 bg-white rounded border border-gray-200">
    <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M5 3a2 2 0 012-2h10a2 2 0 012 2v1h- साइज:M5 3a2 2 0 012-2h10a2 2 0 012 2v1H5V3z" />
        <path fillRule="evenodd" d="M5 6h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2V6zm2 2a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M10 15v4a2 2 0 002 2h0a2 2 0 002-2v-4" />
      </svg>
    </div>
    <h2 className="text-lg font-bold text-slate-800 mt-4" style={{fontFamily: "'Playfair Display', serif"}}>Selamat Datang!</h2>
    <p className="mt-2 text-gray-600 max-w-2xl mx-auto text-sm">
      Siap untuk berkreasi? Ketik ide, pilih kategori, atau coba resep acak.
    </p>
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
          <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-lg shadow-md">
              <LoadingSpinner />
              <p className="mt-4 text-lg font-semibold text-brand-primary">Sedang membuat resep lezat untuk Anda...</p>
              <p className="text-sm text-gray-600">Mohon tunggu sebentar. Makanan enak butuh waktu!</p>
              {recipe && <p className="mt-2 text-sm text-gray-500">Sekarang sedang menyiapkan foto-foto indah untuk "{recipe.name}"...</p>}
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
