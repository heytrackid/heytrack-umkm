import React, { useState } from 'react';
import Header from './components/Header';
import RecipeGenerator from './components/RecipeGenerator';
import MarketingStrategyGenerator from './components/MarketingStrategyGenerator';
import ProductPhotoGenerator from './components/ProductPhotoGenerator';

type Tab = 'recipe' | 'strategy' | 'photo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('recipe');

  const renderContent = () => {
    switch (activeTab) {
      case 'recipe':
        return <RecipeGenerator />;
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
      className={`relative px-4 py-2 md:px-6 font-bold text-sm md:text-base transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary ${
        activeTab === tabId
          ? 'text-brand-primary border-b-2 border-brand-primary'
          : 'text-gray-500 hover:text-brand-primary'
      }`}
      aria-selected={activeTab === tabId}
      role="tab"
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-brand-dark font-sans">
      <Header />
      <main className="container mx-auto p-4">
        <div role="tablist" className="border-b border-gray-200 mb-8">
          <TabButton tabId="recipe">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            Resep
          </TabButton>
          <TabButton tabId="strategy">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
            Pemasaran
          </TabButton>
          <TabButton tabId="photo">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
             </svg>
            Foto
          </TabButton>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;