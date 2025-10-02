import React from 'react';
import { NutritionInfo } from '../types';

interface NutritionTableProps {
  nutrition: NutritionInfo;
}

const NutritionTable: React.FC<NutritionTableProps> = ({ nutrition }) => {
  const nutritionData = [
    { label: 'Kalori', value: nutrition.calories },
    { label: 'Protein', value: nutrition.protein },
    { label: 'Karbohidrat', value: nutrition.carbs },
    { label: 'Lemak', value: nutrition.fat },
  ];

  return (
    <div className="bg-brand-light p-4 md:p-6 rounded-lg border border-orange-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {nutritionData.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-lg md:text-xl font-bold text-brand-primary">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionTable;