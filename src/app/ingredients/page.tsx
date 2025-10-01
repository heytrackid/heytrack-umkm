import { Metadata } from 'next';
import { IngredientsCRUD } from '@/components/crud/ingredients-crud';

export const metadata: Metadata = {
  title: 'Bahan Baku | HeyTrack',
  description: 'Kelola bahan baku dan stok untuk bisnis bakery Anda',
};

export default function IngredientsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bahan Baku
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola bahan baku dan stok untuk produksi
          </p>
        </div>
      </div>

      <IngredientsCRUD />
    </div>
  );
}
