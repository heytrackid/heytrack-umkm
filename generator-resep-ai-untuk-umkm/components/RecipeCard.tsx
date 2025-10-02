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
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-200 animate-fade-in">
      <div className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
            {recipe.name}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">{recipe.description}</p>
        </div>
        
        <ImageGallery images={images} recipeName={recipe.name} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-1">
            <SectionTitle>Bahan-Bahan</SectionTitle>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
              <ul className="space-y-3 text-gray-800">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-orange-500 text-white font-bold text-xs">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <SectionTitle>Cara Membuat</SectionTitle>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
              <ol className="space-y-4 text-gray-800">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mr-4 mt-1 flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        
        <div className="mt-10">
          <SectionTitle>Fakta Nutrisi</SectionTitle>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
            <NutritionTable nutrition={recipe.nutrition} />
            <p className="text-xs text-gray-500 italic text-center mt-4 bg-white/50 px-4 py-2 rounded-full inline-block">
              *Perkiraan AI - Konsultasikan ahli gizi untuk informasi akurat
            </p>
          </div>
        </div>

        <div className="mt-10">
          <SectionTitle>HPP & Harga Jual</SectionTitle>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Masukkan harga bahan untuk menghitung Harga Pokok Produksi dan menentukan harga jual yang tepat.
            </p>
            <HppCalculator 
              ingredients={recipe.ingredients}
              onCalculate={onCalculateHpp}
              isLoading={isCalculatingHpp}
            />
            
            {isCalculatingHpp && (
              <div className="flex flex-col items-center justify-center text-center mt-6">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-3 rounded-full mb-4 shadow-lg">
                  <LoadingSpinner />
                </div>
                <p className="text-lg font-semibold text-slate-800">Menghitung HPP...</p>
                <p className="text-sm text-gray-600 mt-1">Mohon tunggu sebentar</p>
              </div>
            )}

            {hppError && (
              <div className="mt-6 text-center p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl shadow-sm">
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
  );
};

const SectionTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-orange-300 inline-block" style={{fontFamily: "'Playfair Display', serif"}}>
    {children}
  </h3>
);

export default RecipeCard;
