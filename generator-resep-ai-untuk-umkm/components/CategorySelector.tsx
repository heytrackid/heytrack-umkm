import React, { useState } from 'react';

interface CategorySelectorProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
  onRandomGenerate: () => void;
  isLoading: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelectCategory, onRandomGenerate, isLoading }) => {
  const [customQuery, setCustomQuery] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      onSelectCategory(customQuery.trim());
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-center text-slate-800 mb-3">Mulai Ciptakan Resep</h2>
      
      <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto mb-4">
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="Ketik ide resep..."
          disabled={isLoading}
          className="flex-grow w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 disabled:opacity-50"
          aria-label="Ide resep kustom"
        />
        <button
          type="submit"
          disabled={isLoading || !customQuery.trim()}
          className="px-4 py-2 font-medium text-white bg-brand-primary rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buat
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 font-medium mb-3">Atau Pilih Kategori</p>
      
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-brand-primary bg-orange-100 border border-brand-secondary/50 rounded-lg hover:bg-brand-secondary hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={onRandomGenerate}
          disabled={isLoading}
          className="px-4 py-1.5 font-medium text-gray-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 -mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Acak
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;