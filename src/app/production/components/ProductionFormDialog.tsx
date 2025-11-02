'use client'

import { useState, useEffect } from 'react'
import type { RecipesTable } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { uiLogger } from '@/lib/logger'
import { id as idLocale } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


type Recipe = RecipesTable

interface ProductionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export const ProductionFormDialog = ({ open, onOpenChange, onSuccess }: ProductionFormDialogProps) => {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingRecipes, setLoadingRecipes] = useState(true)
    const [formData, setFormData] = useState({
        recipe_id: '',
        quantity: '',
        planned_date: new Date(),
        notes: ''
    })

    useEffect(() => {
        if (open) {
            fetchRecipes()
        }
    }, [open])

    const fetchRecipes = async () => {
        try {
            setLoadingRecipes(true)
            const response = await fetch('/api/recipes')
            if (response.ok) {
                const data = await response.json()
                // Ensure data is an array
                setRecipes(Array.isArray(data) ? data : [])
            } else {
                setRecipes([])
            }
        } catch (error) {
            uiLogger.error({ error }, 'Error fetching recipes')
            toast.error('Gagal memuat daftar resep')
            setRecipes([])
        } finally {
            setLoadingRecipes(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.recipe_id || !formData.quantity) {
            toast.error('Mohon lengkapi semua field yang wajib diisi')
            return
        }

        const quantity = parseFloat(formData.quantity)
        if (isNaN(quantity) || quantity <= 0) {
            toast.error('Quantity harus berupa angka positif')
            return
        }

        try {
            setLoading(true)
            const response = await fetch('/api/production-batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipe_id: formData.recipe_id,
                    quantity,
                    planned_date: formData.planned_date.toISOString(),
                    notes: formData.notes || null
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Gagal membuat batch produksi')
            }

            toast.success('Batch produksi berhasil dibuat')
            onSuccess()
            onOpenChange(false)
            resetForm()
        } catch (error) {
            uiLogger.error({ error }, 'Error creating production batch')
            toast.error(error instanceof Error ? error.message : 'Gagal membuat batch produksi')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            recipe_id: '',
            quantity: '',
            planned_date: new Date(),
            notes: ''
        })
    }

    // const selectedRecipe = recipes.find(r => r.id === formData.recipe_id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-wrap-mobile">Buat Batch Produksi Baru</DialogTitle>
                    <DialogDescription>
                        Rencanakan batch produksi untuk resep yang akan diproduksi
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recipe Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="recipe">
                            Resep <span className="text-red-500">*</span>
                        </Label>
                        {loadingRecipes ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Select
                                value={formData.recipe_id}
                                onValueChange={(value) => setFormData({ ...formData, recipe_id: value })}
                            >
                                <SelectTrigger id="recipe">
                                    <SelectValue placeholder="Pilih resep" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(recipes) && recipes.length > 0 ? (
                                        recipes.map((recipe) => (
                                            <SelectItem key={recipe.id} value={recipe.id}>
                                                {recipe.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Tidak ada resep tersedia
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Jumlah Produksi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                    </div>

                    {/* Planned Date */}
                    <div className="space-y-2">
                        <Label>
                            Tanggal Rencana Produksi <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !formData.planned_date && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.planned_date ? (
                                        format(formData.planned_date, 'dd MMMM yyyy', { locale: idLocale })
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.planned_date}
                                    onSelect={(date) => date && setFormData({ ...formData, planned_date: date })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Tambahkan catatan untuk batch produksi ini..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading || loadingRecipes}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Buat Batch
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
