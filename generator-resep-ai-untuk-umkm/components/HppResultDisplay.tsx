import React from 'react';
import { HppResult } from '../types';

interface HppResultDisplayProps {
  result: HppResult;
}

const HppResultDisplay: React.FC<HppResultDisplayProps> = ({ result }) => {
  const tierColors = {
    Ekonomis: 'bg-green-100 border-green-300 text-green-800',
    Standar: 'bg-blue-100 border-blue-300 text-blue-800',
    Premium: 'bg-purple-100 border-purple-300 text-purple-800',
  };
  
  return (
    <div className="space-y-6">
        <div className="text-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-sm text-gray-500">Estimasi HPP per Porsi</p>
            <p className="text-3xl font-bold text-brand-primary">{result.hppPerPortion}</p>
        </div>

        <div>
            <h4 className="text-lg font-bold text-slate-800 mb-3 text-center">Rekomendasi Harga Jual</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.suggestedPrices.map((tier) => (
                    <div key={tier.level} className={`p-4 rounded-lg border ${tierColors[tier.level] || 'bg-gray-100 border-gray-300'}`}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierColors[tier.level].replace('border-', 'bg-').replace('text-', 'text-white ')}`}>{tier.level}</span>
                        <p className="text-2xl font-bold my-1">{tier.price}</p>
                        <p className="text-xs">{tier.justification}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default HppResultDisplay;
