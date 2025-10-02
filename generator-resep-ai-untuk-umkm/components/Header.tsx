import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: "'Playfair Display', serif"}}>
            Generator Resep AI
          </h1>
        </div>
        <p className="text-orange-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Asisten AI untuk Inovasi Menu & Strategi Bisnis F&B Anda
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-white/10 px-4 py-2 rounded-full">
            <span className="text-white text-sm font-medium">✨ Powered by AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;