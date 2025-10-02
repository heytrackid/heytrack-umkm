import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-6 text-center border-b">
        <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily: "'Playfair Display', serif"}}>
          Generator Resep AI
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          Asisten AI untuk Inovasi Menu & Strategi Bisnis F&B Anda
        </p>
      </div>
    </header>
  );
};

export default Header;