import React, { useState } from 'react';
import { Recipe, HppResult } from '../types';
import ImageGallery from './ImageGallery';
import RecipeNutritionInfo from './RecipeNutritionInfo';
import HppCalculator from './HppCalculator';
import HppResultDisplay from './HppResultDisplay';
import LoadingSpinner from './LoadingSpinner';
import RecipeVariations from './RecipeVariations';
import SmartScaling from './SmartScaling';

const SectionTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-orange-300 inline-block" style={{fontFamily: "'Inter', sans-serif"}}>
    {children}
  </h3>
);

interface RecipeCardProps {
  recipe: Recipe;
  images: string[];
  onCalculateHpp: (costs: { [key: string]: string }) => void;
  hppResult: HppResult | null;
  isCalculatingHpp: boolean;
  hppError: string | null;
  onVariationSelect?: (recipe: Recipe) => void;
  onScaledRecipe?: (recipe: Recipe, scaleFactor: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  images,
  onCalculateHpp,
  hppResult,
  isCalculatingHpp,
  hppError,
  onVariationSelect,
  onScaledRecipe
}) => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'variations' | 'scaling'>('recipe');

  const handleVariationSelect = (selectedRecipe: Recipe) => {
    if (onVariationSelect) {
      onVariationSelect(selectedRecipe);
    }
  };

  const handleScaledRecipe = (scaledRecipe: Recipe, scaleFactor: number) => {
    if (onScaledRecipe) {
      onScaledRecipe(scaledRecipe, scaleFactor);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-12 border-b border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
              <span className="text-3xl">🍳</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
              {recipe.name}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          <ImageGallery images={images} recipeName={recipe.name} />

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('recipe')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'recipe'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📖 Resep
              </button>
              <button
                onClick={() => setActiveTab('variations')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'variations'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✨ Variasi
              </button>
              <button
                onClick={() => setActiveTab('scaling')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'scaling'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📏 Scaling
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'recipe' && (
            <div className="animate-fade-in">
              {/* Recipe Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Ingredients Section */}
                <div className="xl:col-span-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-xl">🥕</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900" style={{fontFamily: "'Inter', sans-serif"}}>
                        Bahan-Bahan
                      </h3>
                    </div>
                    <ul className="space-y-4">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start group">
                          <span className="flex-shrink-0 mr-4 mt-1 flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold text-sm group-hover:bg-orange-600 transition-colors duration-200">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed pt-1">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="xl:col-span-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-xl">👨‍🍳</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900" style={{fontFamily: "'Inter', sans-serif"}}>
                        Cara Membuat
                      </h3>
                    </div>
                    <ol className="space-y-6">
                      {recipe.instructions.map((step, index) => (
                        <li key={index} className="flex items-start group">
                          <span className="flex-shrink-0 mr-6 mt-2 flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-bold text-lg group-hover:bg-blue-600 transition-colors duration-200">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed text-lg pt-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Nutrition & HPP Section */}
              <div className="mt-16 space-y-12">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{fontFamily: "'Inter', sans-serif"}}>
                    Informasi Tambahan
                  </h3>
                  <div className="w-24 h-1 bg-orange-400 rounded-full mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Nutrition Info */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                    <RecipeNutritionInfo recipe={recipe} />
                  </div>

                  {/* HPP Calculator */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: "'Inter', sans-serif"}}>
                        💰 Harga Pokok Produksi
                      </h4>
                      <p className="text-gray-600">
                        Masukkan harga bahan untuk menghitung HPP dan harga jual yang tepat
                      </p>
                    </div>
                    <HppCalculator
                      ingredients={recipe.ingredients}
                      isLoading={isCalculatingHpp}
                    />

                    {isCalculatingHpp && (
                      <div className="flex flex-col items-center justify-center text-center mt-8">
                        <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 rounded-full mb-4">
                          <LoadingSpinner />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">Menghitung HPP...</p>
                        <p className="text-sm text-gray-600 mt-1">Mohon tunggu sebentar</p>
                      </div>
                    )}

                    {hppError && (
                      <div className="mt-6 text-center p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl">
                        <h4 className="font-bold text-lg mb-2">Terjadi Kesalahan</h4>
                        <p className="text-sm">{hppError}</p>
                      </div>
                    )}

                    {hppResult && !isCalculatingHpp && (
                      <div className="mt-6 animate-fade-in">
                        <HppResultDisplay result={hppResult} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variations' && (
            <div className="animate-fade-in">
              <RecipeVariations baseRecipe={recipe} onVariationSelect={handleVariationSelect} />
            </div>
          )}

          {activeTab === 'scaling' && (
            <div className="animate-fade-in">
              <SmartScaling recipe={recipe} onScaledRecipe={handleScaledRecipe} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
