import React, { useState } from 'react';
import { RECIPE_CATEGORIES_GROUPED } from '../constants';

interface SidebarProps {
  onSelectCategory: (category: string) => void;
  onRandomGenerate: () => void;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSelectCategory,
  onRandomGenerate,
  isLoading,
  isOpen,
  onToggle
}) => {
  const [expandedGroup, setExpandedGroup] = useState<string>('Makanan Umum');

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? '' : group);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800" style={{fontFamily: "'Inter', sans-serif"}}>
            🍳 Generator Resep AI
          </h2>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <button
              onClick={onRandomGenerate}
              disabled={isLoading}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              Acak Resep
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Kategori Resep
            </h3>
            <div className="space-y-2">
              {Object.entries(RECIPE_CATEGORIES_GROUPED).map(([group, categories]) => (
                <div key={group} className="bg-gray-50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="font-medium">{group}</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        expandedGroup === group ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedGroup === group && (
                    <div className="px-4 pb-3 space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            onSelectCategory(category);
                            if (window.innerWidth < 1024) {
                              onToggle(); // Close sidebar on mobile after selection
                            }
                          }}
                          disabled={isLoading}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Ide Kustom
            </h3>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Ketik ide resep..."
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buat Resep
              </button>
            </form>
          </div>

          {/* Features Info */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Fitur Unggulan
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Recipe Variations ✨
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Smart Scaling 📏
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                HPP Calculator 💰
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Marketing Strategy 🎯
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
