import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RecipeGenerator from './components/RecipeGenerator';
import MarketingStrategyGenerator from './components/MarketingStrategyGenerator';
import ProductPhotoGenerator from './components/ProductPhotoGenerator';
import { RecipeProvider } from './components/RecipeContext';

type Tab = 'recipe' | 'strategy' | 'photo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('recipe');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const recipeGeneratorRef = useRef<any>(null);

  const handleGenerateRecipe = (category: string) => {
    setActiveTab('recipe');
    if (recipeGeneratorRef.current) {
      recipeGeneratorRef.current.handleGenerateRecipe(category);
    }
  };

  const handleGenerateRandomRecipe = () => {
    setActiveTab('recipe');
    if (recipeGeneratorRef.current) {
      recipeGeneratorRef.current.handleRandomGenerate();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recipe':
        return <RecipeGenerator ref={recipeGeneratorRef} />;
      case 'strategy':
        return <MarketingStrategyGenerator />;
      case 'photo':
        return <ProductPhotoGenerator />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabId: Tab; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`relative px-6 py-4 md:px-8 font-semibold text-base md:text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-t-lg ${
        activeTab === tabId
          ? 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md transform scale-105'
          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
      }`}
      aria-selected={activeTab === tabId}
      role="tab"
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          onSelectCategory={handleGenerateRecipe}
          onRandomGenerate={handleGenerateRandomRecipe}
          isLoading={false}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div role="tablist" className="flex bg-gray-100 border-b border-gray-200">
                <TabButton tabId="recipe">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                  Resep
                </TabButton>
                <TabButton tabId="strategy">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                  Pemasaran
                </TabButton>
                <TabButton tabId="photo">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                   </svg>
                  Foto
                </TabButton>
              </div>
              <div className="p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                  <RecipeProvider
                    onGenerateRecipe={handleGenerateRecipe}
                    onGenerateRandomRecipe={handleGenerateRandomRecipe}
                  >
                    {renderContent()}
                  </RecipeProvider>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;