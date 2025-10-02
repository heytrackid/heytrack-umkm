import React from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo and Title */}
          <div className="flex items-center flex-1 lg:flex-none lg:justify-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900" style={{fontFamily: "'Inter', sans-serif"}}>
                Generator Resep AI
              </h1>
              <p className="text-gray-600 text-sm lg:text-base font-medium mt-1">
                Asisten AI untuk Inovasi Menu & Strategi Bisnis F&B Anda
              </p>
            </div>
          </div>

          {/* Desktop Spacer */}
          <div className="hidden lg:block w-10"></div>
        </div>

        {/* Powered by AI Badge */}
        <div className="mt-4 flex justify-center lg:justify-start">
          <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
            <span className="text-orange-700 text-sm font-medium">✨ Powered by AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;