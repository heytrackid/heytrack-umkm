'use client'

import AppLayout from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSettings } from '@/contexts/settings-context'
import { createSupabaseClient } from '@/lib/supabase'
import { AlertCircle, ChefHat, Clock, DollarSign, Loader2, Sparkles } from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'

export default function AIRecipeGeneratorPage() {
    const { formatCurrency } = useSettings()
    const [loading, setLoading] = useState(false)
    const [generatedRecipe, setGeneratedRecipe] = useState<any>(null)

    // Form state
    const [productName, setProductName] = useState('')
    const [productType, setProductType] = useState('bread')
    const [servings, setServings] = useState(2)
    const [targetPrice, setTargetPrice] = useState('')
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
    const [availableIngredients, setAvailableIngredients] = useState<any[]>([])
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])

    // Fetch user's ingredients
    useEffect(() => {
        fetchIngredients()
    }, [])

    const fetchIngredients = async () => {
        const supabase = createSupabaseClient()
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .order('name')

        if (!error && data) {
            setAvailableIngredients(data)
        }
    }

    const handleGenerate = async () => {
        if (!productName || !productType || !servings) {
            alert('Mohon isi semua field yang wajib')
            return
        }

        setLoading(true)
        setGeneratedRecipe(null)

        try {
            const supabase = createSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('User not authenticated')
            }

            const response = await fetch('/api/ai/generate-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName,
                    productType,
                    servings,
                    targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
                    dietaryRestrictions,
                    availableIngredients: selectedIngredients,
                    userId: user.id
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate recipe')
            }

            const data = await response.json()
            setGeneratedRecipe(data.recipe)
        } catch (error: any) {
            console.error('Error generating recipe:', error)
            alert(error.message || 'Gagal generate resep')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveRecipe = async () => {
        if (!generatedRecipe) return

        try {
            const supabase = createSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('User not authenticated')
            }

            // Save recipe to database
            const { data: recipe, error: recipeError } = await supabase
                .from('recipes')
                .insert({
                    user_id: user.id,
                    name: generatedRecipe.name,
                    category: generatedRecipe.category,
                    servings: generatedRecipe.servings,
                    prep_time: generatedRecipe.prep_time_minutes,
                    cook_time: generatedRecipe.bake_time_minutes,
                    description: generatedRecipe.description,
                    instructions: generatedRecipe.instructions,
                    tips: generatedRecipe.tips,
                    storage_instructions: generatedRecipe.storage,
                    shelf_life: generatedRecipe.shelf_life,
                    is_active: true
                })
                .select()
                .single()

            if (recipeError) throw recipeError

            // Save recipe ingredients
            const recipeIngredients = generatedRecipe.ingredients.map((ing: any) => {
                const ingredient = availableIngredients.find(
                    i => i.name.toLowerCase() === ing.name.toLowerCase()
                )

                return {
                    recipe_id: recipe.id,
                    ingredient_id: ingredient?.id,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    notes: ing.notes
                }
            })

            const { error: ingredientsError } = await supabase
                .from('recipe_ingredients')
                .insert(recipeIngredients)

            if (ingredientsError) throw ingredientsError

            alert('✅ Resep berhasil disimpan!')

            // Reset form
            setGeneratedRecipe(null)
            setProductName('')
            setServings(2)
            setTargetPrice('')
            setSelectedIngredients([])

        } catch (error: any) {
            console.error('Error saving recipe:', error)
            alert('Gagal menyimpan resep: ' + error.message)
        }
    }

    const toggleDietaryRestriction = (restriction: string) => {
        setDietaryRestrictions(prev =>
            prev.includes(restriction)
                ? prev.filter(r => r !== restriction)
                : [...prev, restriction]
        )
    }

    return (
        <AppLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Recipe Generator</h1>
                        <p className="text-muted-foreground">
                            Generate resep bakery profesional dengan AI dalam hitungan detik
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Input Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ChefHat className="h-5 w-5" />
                                Detail Produk
                            </CardTitle>
                            <CardDescription>
                                Isi informasi produk yang ingin kamu buat
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* Product Name */}
                            <div className="space-y-2">
                                <Label htmlFor="productName">Nama Produk *</Label>
                                <Input
                                    id="productName"
                                    placeholder="Contoh: Roti Tawar Premium"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>

                            {/* Product Type */}
                            <div className="space-y-2">
                                <Label htmlFor="productType">Jenis Produk *</Label>
                                <Select value={productType} onValueChange={setProductType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bread">Roti</SelectItem>
                                        <SelectItem value="cake">Kue</SelectItem>
                                        <SelectItem value="pastry">Pastry</SelectItem>
                                        <SelectItem value="cookies">Cookies</SelectItem>
                                        <SelectItem value="donuts">Donat</SelectItem>
                                        <SelectItem value="other">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Servings */}
                            <div className="space-y-2">
                                <Label htmlFor="servings">Jumlah Hasil (Servings) *</Label>
                                <Input
                                    id="servings"
                                    type="number"
                                    min="1"
                                    value={servings}
                                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Berapa banyak unit yang dihasilkan dari resep ini
                                </p>
                            </div>

                            {/* Target Price */}
                            <div className="space-y-2">
                                <Label htmlFor="targetPrice">Target Harga Jual (Optional)</Label>
                                <Input
                                    id="targetPrice"
                                    type="number"
                                    placeholder="85000"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    AI akan optimize resep untuk mencapai margin yang sehat
                                </p>
                            </div>

                            {/* Dietary Restrictions */}
                            <div className="space-y-2">
                                <Label>Dietary Restrictions (Optional)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Halal', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'].map(restriction => (
                                        <Badge
                                            key={restriction}
                                            variant={dietaryRestrictions.includes(restriction) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => toggleDietaryRestriction(restriction)}
                                        >
                                            {restriction}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Preferred Ingredients */}
                            <div className="space-y-2">
                                <Label>Bahan yang Ingin Digunakan (Optional)</Label>
                                <Textarea
                                    placeholder="Contoh: coklat premium, keju cheddar, kismis"
                                    value={selectedIngredients.join(', ')}
                                    onChange={(e) => setSelectedIngredients(
                                        e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    )}
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Pisahkan dengan koma. AI akan prioritaskan bahan ini.
                                </p>
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !productName}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating Magic...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Resep dengan AI
                                    </>
                                )}
                            </Button>

                            {availableIngredients.length === 0 && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-medium">Belum ada bahan di inventory</p>
                                        <p className="mt-1">
                                            Tambahkan bahan baku dulu agar AI bisa generate resep yang akurat dengan perhitungan HPP.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Generated Recipe Display */}
                    <div className="space-y-6">
                        {loading && (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto animate-pulse">
                                            <ChefHat className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">AI sedang meracik resep...</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Tunggu sebentar ya, ini butuh waktu 10-30 detik
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {generatedRecipe && (
                            <>
                                {/* Recipe Header */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl">{generatedRecipe.name}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    {generatedRecipe.description}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="capitalize">
                                                {generatedRecipe.difficulty}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-3 bg-muted rounded-lg">
                                                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                                <p className="text-sm font-medium">{generatedRecipe.total_time_minutes} min</p>
                                                <p className="text-xs text-muted-foreground">Total Time</p>
                                            </div>
                                            <div className="text-center p-3 bg-muted rounded-lg">
                                                <ChefHat className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                                <p className="text-sm font-medium">{generatedRecipe.servings} units</p>
                                                <p className="text-xs text-muted-foreground">Yield</p>
                                            </div>
                                            <div className="text-center p-3 bg-muted rounded-lg">
                                                <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                                <p className="text-sm font-medium">
                                                    {formatCurrency(generatedRecipe.hpp?.hppPerUnit || 0)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">HPP/unit</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                                {/* HPP Calculation */}
                                {generatedRecipe.hpp && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Perhitungan HPP</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-sm">Biaya Bahan Baku</span>
                                                <span className="font-medium">
                                                    {formatCurrency(generatedRecipe.hpp.totalMaterialCost)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-sm">Biaya Operasional (estimasi)</span>
                                                <span className="font-medium">
                                                    {formatCurrency(generatedRecipe.hpp.estimatedOperationalCost)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b font-semibold">
                                                <span>Total HPP</span>
                                                <span>{formatCurrency(generatedRecipe.hpp.totalHPP)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 text-lg font-bold text-primary">
                                                <span>HPP per Unit</span>
                                                <span>{formatCurrency(generatedRecipe.hpp.hppPerUnit)}</span>
                                            </div>
                                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                                    💡 Rekomendasi Harga Jual
                                                </p>
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                                    {formatCurrency(generatedRecipe.hpp.suggestedSellingPrice)}
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                    Margin: ~{generatedRecipe.hpp.estimatedMargin}% (Sehat!)
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Ingredients */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Bahan-Bahan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {generatedRecipe.ingredients?.map((ing: any, index: number) => (
                                                <li key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <span className="font-medium">{ing.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {ing.quantity} {ing.unit}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Instructions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Cara Membuat</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="space-y-4">
                                            {generatedRecipe.instructions?.map((step: any, index: number) => (
                                                <li key={index} className="flex gap-3">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                        {step.step}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{step.title}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {step.description}
                                                        </p>
                                                        {step.duration_minutes && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                ⏱️ {step.duration_minutes} menit
                                                                {step.temperature && ` • 🌡️ ${step.temperature}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </CardContent>
                                </Card>

                                {/* Tips */}
                                {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Tips Profesional</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {generatedRecipe.tips.map((tip: string, index: number) => (
                                                    <li key={index} className="flex gap-2">
                                                        <span className="text-primary">💡</span>
                                                        <span className="text-sm">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Storage & Shelf Life */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Penyimpanan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <p className="text-sm font-medium">Cara Penyimpanan:</p>
                                            <p className="text-sm text-muted-foreground">{generatedRecipe.storage}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Shelf Life:</p>
                                            <p className="text-sm text-muted-foreground">{generatedRecipe.shelf_life}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button onClick={handleSaveRecipe} className="flex-1" size="lg">
                                        💾 Simpan Resep
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setGeneratedRecipe(null)}
                                        size="lg"
                                    >
                                        🔄 Generate Lagi
                                    </Button>
                                </div>
                            </>
                        )}

                        {!loading && !generatedRecipe && (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center text-muted-foreground">
                                        <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="font-medium">Resep akan muncul di sini</p>
                                        <p className="text-sm mt-1">
                                            Isi form di sebelah kiri dan klik "Generate Resep dengan AI"
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
