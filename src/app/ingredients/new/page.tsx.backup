'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { ArrowLeft, Save, Package } from 'lucide-react';
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
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/ingredients">Bahan Baku</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tambah Bahan Baku</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Tambah Bahan Baku
          </h1>
          <p className="text-muted-foreground">
            Tambahkan bahan baku baru ke inventori Anda
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Bahan Baku</CardTitle>
              <CardDescription>
                Lengkapi form di bawah untuk menambahkan bahan baku baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Nama Bahan Baku *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Tepung Terigu"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Satuan *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price per unit */}
                <div className="space-y-2">
                  <Label htmlFor="price_per_unit">Harga per Satuan *</Label>
                  <Input
                    type="number"
                    id="price_per_unit"
                    name="price_per_unit"
                    value={formData.price_per_unit}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                {/* Current Stock */}
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Stok Saat Ini *</Label>
                  <Input
                    type="number"
                    id="current_stock"
                    name="current_stock"
                    value={formData.current_stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                {/* Minimum Stock */}
                <div className="space-y-2">
                  <Label htmlFor="minimum_stock">Stok Minimum *</Label>
                  <Input
                    type="number"
                    id="minimum_stock"
                    name="minimum_stock"
                    value={formData.minimum_stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="Nama supplier"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Contoh: Bahan Dasar"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Deskripsi bahan baku"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/ingredients')}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan Bahan Baku'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
