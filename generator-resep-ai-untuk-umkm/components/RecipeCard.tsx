import React from 'react';
import { Recipe, HppResult } from '../types';
import ImageGallery from './ImageGallery';
import NutritionTable from './NutritionTable';
import HppCalculator from './HppCalculator';
import HppResultDisplay from './HppResultDisplay';
import LoadingSpinner from './LoadingSpinner';

interface RecipeCardProps {
  recipe: Recipe;
  images: string[];
  onCalculateHpp: (costs: { [key: string]: string }) => void;
  hppResult: HppResult | null;
  isCalculatingHpp: boolean;
  hppError: string | null;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, images, onCalculateHpp, hppResult, isCalculatingHpp, hppError }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in border border-gray-200">
      <div className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-brand-dark text-center mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
          {recipe.name}
        </h2>
        <p className="text-gray-600 text-center text-sm mb-4">{recipe.description}</p>
        
        <ImageGallery images={images} recipeName={recipe.name} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
          <div className="md:col-span-1">
            <SectionTitle>Bahan-Bahan</SectionTitle>
            <ul className="space-y-1 text-gray-700 list-disc list-inside bg-orange-50 p-3 rounded border border-gray-200">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <SectionTitle>Cara Membuat</SectionTitle>
            <ol className="space-y-2 text-gray-800">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 mr-2 mt-1 flex items-center justify-center h-5 w-5 rounded-full bg-brand-primary text-white font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        <div className="mt-6">
            <SectionTitle>Fakta Nutrisi</SectionTitle>
            <NutritionTable nutrition={recipe.nutrition} />
            <p className="text-xs text-gray-500 italic text-center mt-2">
                *Perkiraan AI
            </p>
        </div>

        <div className="mt-6">
            <SectionTitle>HPP & Harga Jual</SectionTitle>
            <div className="bg-brand-light/30 p-4 rounded border border-gray-200">
                <p className="text-xs text-slate-600 mb-3">
                    Masukkan harga bahan untuk menghitung HPP.
                </p>
                <HppCalculator 
                    ingredients={recipe.ingredients}
                    onCalculate={onCalculateHpp}
                    isLoading={isCalculatingHpp}
                />
                
                {isCalculatingHpp && (
                    <div className="flex flex-col items-center justify-center text-center mt-3">
                        <LoadingSpinner />
                        <p className="mt-1 text-sm font-semibold text-brand-primary">Menghitung...</p>
                    </div>
                )}

                {hppError && (
                    <div className="mt-3 text-center p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
                        <h4 className="font-bold">Error</h4>
                        <p>{hppError}</p>
                    </div>
                )}

                {hppResult && !isCalculatingHpp && (
                    <div className="mt-3 animate-fade-in">
                        <HppResultDisplay result={hppResult} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <h3 className="text-md font-bold text-brand-dark mb-2 pb-1 border-b border-gray-300" style={{fontFamily: "'Playfair Display', serif"}}>
        {children}
    </h3>
);

export default RecipeCard;
