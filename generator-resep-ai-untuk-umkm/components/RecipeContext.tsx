import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RecipeContextType {
  generateRecipe: (category: string) => void;
  generateRandomRecipe: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};

interface RecipeProviderProps {
  children: ReactNode;
  onGenerateRecipe: (category: string) => void;
  onGenerateRandomRecipe: () => void;
}

export const RecipeProvider: React.FC<RecipeProviderProps> = ({
  children,
  onGenerateRecipe,
  onGenerateRandomRecipe
}) => {
  const value = {
    generateRecipe: onGenerateRecipe,
    generateRandomRecipe: onGenerateRandomRecipe
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};
