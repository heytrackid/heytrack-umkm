import { Metadata } from 'next';
import { IngredientsCRUD } from '@/components/crud/ingredients-crud';
import { createSupabaseClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Bahan Baku | HeyTrack',
  description: 'Kelola bahan baku dan stok untuk bisnis bakery Anda',
};

export const dynamic = 'force-dynamic';

async function getIngredients() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getIngredients:', error);
    return [];
  }
}

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

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

      <IngredientsCRUD initialIngredients={ingredients} />
    </div>
  );
}
