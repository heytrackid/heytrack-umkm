import React, { useState, useEffect } from 'react';

interface HppCalculatorProps {
  ingredients: string[];
  onCalculate: (costs: { [key: string]: string }) => void;
  isLoading: boolean;
}

const HppCalculator: React.FC<HppCalculatorProps> = ({ ingredients, onCalculate, isLoading }) => {
  const [costs, setCosts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Reset costs when ingredients change
    setCosts({});
  }, [ingredients]);

  const handleCostChange = (ingredient: string, value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setCosts(prev => ({ ...prev, [ingredient]: numericValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(costs);
  };
  
  const isFormComplete = ingredients.every(ing => costs[ing]?.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center">
            <label htmlFor={`cost-${index}`} className="w-2/3 text-sm text-slate-700 pr-2">{ingredient}</label>
            <div className="relative w-1/3">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">Rp</span>
                <input
                  id={`cost-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={costs[ingredient] || ''}
                  onChange={(e) => handleCostChange(ingredient, e.target.value)}
                  placeholder="Harga"
                  disabled={isLoading}
                  className="w-full pl-8 pr-2 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-secondary focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                  aria-label={`Harga untuk ${ingredient}`}
                />
            </div>
          </div>
        ))}
      </div>
       <div className="text-center pt-2">
        <button
          type="submit"
          disabled={isLoading || !isFormComplete}
          className="w-full md:w-auto px-8 py-2.5 font-bold text-white bg-brand-primary rounded-full hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          Hitung & Beri Saran Harga
        </button>
      </div>
    </form>
  );
};

export default HppCalculator;
