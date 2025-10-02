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
    <div className="p-6 bg-gradient-to-br from-white to-orange-50 rounded-xl border border-orange-200 shadow-lg">
      <h2 className="text-xl font-bold text-center text-slate-800 mb-6" style={{fontFamily: "'Playfair Display', serif"}}>Mulai Ciptakan Resep</h2>
      
      <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="Ketik ide resep..."
          disabled={isLoading}
          className="flex-grow w-full px-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 disabled:opacity-50 shadow-sm"
          aria-label="Ide resep kustom"
        />
        <button
          type="submit"
          disabled={isLoading || !customQuery.trim()}
          className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Buat
        </button>
      </form>

      <div className="text-center mb-6">
        <div className="inline-flex items-center">
          <div className="h-px bg-gradient-to-r from-transparent to-orange-300 flex-1"></div>
          <span className="px-4 text-sm font-medium text-gray-500 bg-gradient-to-r from-orange-50 to-white rounded-full border border-orange-200">ATAU PILIH KATEGORI</span>
          <div className="h-px bg-gradient-to-l from-transparent to-orange-300 flex-1"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            disabled={isLoading}
            className="p-3 text-sm font-medium text-orange-700 bg-white border border-orange-200 rounded-lg hover:bg-orange-500 hover:text-white hover:border-orange-500 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md"
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={onRandomGenerate}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 font-medium text-slate-700 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          Surprise Me!
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;