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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectCategory={handleGenerateRecipe}
          onRandomGenerate={handleGenerateRandomRecipe}
          isLoading={false}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
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