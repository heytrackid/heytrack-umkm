'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface IngredientFormData {
  name: string;
  unit: string;
  price_per_unit: number;
  supplier?: string;
  minimum_stock: number;
  current_stock: number;
  description?: string;
  category?: string;
}

export default function NewIngredientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    unit: 'kg',
    price_per_unit: 0,
    supplier: '',
    minimum_stock: 0,
    current_stock: 0,
    description: '',
    category: '',
  });

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'l', label: 'Liter (l)' },
    { value: 'ml', label: 'Mililiter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'dozen', label: 'Dozen' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('ingredients')
        .insert([formData]);

      if (insertError) throw insertError;

      router.push('/ingredients');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating ingredient:', err);
      setError(err.message || 'Failed to create ingredient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/ingredients" 
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Bahan Baku
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tambah Bahan Baku
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tambahkan bahan baku baru ke inventori Anda
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Bahan Baku *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Contoh: Tepung Terigu"
              />
            </div>

            {/* Unit */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Satuan *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {unitOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price per unit */}
            <div>
              <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga per Satuan *
              </label>
              <input
                type="number"
                id="price_per_unit"
                name="price_per_unit"
                value={formData.price_per_unit}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Current Stock */}
            <div>
              <label htmlFor="current_stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stok Saat Ini *
              </label>
              <input
                type="number"
                id="current_stock"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Minimum Stock */}
            <div>
              <label htmlFor="minimum_stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stok Minimum *
              </label>
              <input
                type="number"
                id="minimum_stock"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Supplier */}
            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nama supplier"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Contoh: Bahan Dasar"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Deskripsi bahan baku"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href="/ingredients"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Bahan Baku'}
          </button>
        </div>
      </form>
    </div>
  );
}
