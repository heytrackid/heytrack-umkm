import React from 'react';

interface SidebarProps {
  activeTab: 'recipe' | 'strategy' | 'photo';
  onTabChange: (tab: 'recipe' | 'strategy' | 'photo') => void;
  onSelectCategory: (category: string) => void;
  onRandomGenerate: () => void;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onSelectCategory,
  onRandomGenerate,
  isLoading,
  isOpen,
  onToggle
}) => {
  const navigationItems = [
    {
      id: 'recipe' as const,
      name: 'Generator Resep',
      icon: '🍳',
      description: 'Buat resep AI untuk bisnis kuliner'
    },
    {
      id: 'strategy' as const,
      name: 'Strategi Pemasaran',
      icon: '🎯',
      description: 'Optimalkan marketing UMKM Anda'
    },
    {
      id: 'photo' as const,
      name: 'Generator Foto',
      icon: '📸',
      description: 'Buat foto produk menarik'
    }
  ];

  const handleTabClick = (tabId: 'recipe' | 'strategy' | 'photo') => {
    onTabChange(tabId);
    if (window.innerWidth < 1024) {
      onToggle(); // Close sidebar on mobile
    }
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
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
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
          {/* Main Navigation */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Navigasi Utama
            </h3>
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-start p-4 text-left rounded-lg border transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-orange-50 border-orange-200 text-orange-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex-shrink-0 mr-3">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${
                      activeTab === item.id ? 'text-orange-900' : 'text-gray-900'
                    }`}>
                      {item.name}
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      activeTab === item.id ? 'text-orange-700' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  {activeTab === item.id && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions - Only show when Recipe tab is active */}
          {activeTab === 'recipe' && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Quick Actions
              </h3>
              <button
                onClick={() => {
                  onRandomGenerate();
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                disabled={isLoading}
                className="w-full flex items-center px-4 py-3 text-left text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
                Acak Resep
              </button>
            </div>
          )}

          {/* App Info */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                <span className="text-xl">🚀</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Generator Resep AI
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Membantu UMKM Indonesia berkembang dengan teknologi AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
