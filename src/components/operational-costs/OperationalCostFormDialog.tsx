'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import type { OperationalCostsTable, OperationalCostsInsert } from '@/types/database'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type OperationalCost = OperationalCostsTable

interface OperationalCostFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    cost?: OperationalCost
    onSuccess?: () => void
}

const COST_CATEGORIES = [
    { id: 'utilities', name: 'Utilitas', icon: '⚡', description: 'Listrik, air, gas' },
    { id: 'rent', name: 'Sewa & Properti', icon: '🏢', description: 'Sewa tempat, PBB' },
    { id: 'staff', name: 'Gaji Karyawan', icon: '👥', description: 'Gaji, tunjangan' },
    { id: 'transport', name: 'Transport & Logistik', icon: '🚚', description: 'BBM, ongkir' },
    { id: 'communication', name: 'Komunikasi', icon: '📞', description: 'Telepon, internet' },
    { id: 'insurance', name: 'Asuransi & Keamanan', icon: '🛡️', description: 'Asuransi, keamanan' },
    { id: 'maintenance', name: 'Perawatan', icon: '🔧', description: 'Service peralatan' },
    { id: 'other', name: 'Lainnya', icon: '📦', description: 'Biaya lainnya' },
]

export const OperationalCostFormDialog = ({
    open,
    onOpenChange,
    cost,
    onSuccess
}: OperationalCostFormDialogProps) => {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const mode = cost ? 'edit' : 'create'

    const [formData, setFormData] = useState<Partial<OperationalCostsInsert>>({
        description: '',
        category: 'utilities',
        amount: 0,
        frequency: 'monthly',
        recurring: false,
        notes: '',
    })

    useEffect(() => {
        if (cost) {
            setFormData(cost)
        } else {
            setFormData({
                description: '',
                category: 'utilities',
                amount: 0,
                frequency: 'monthly',
                recurring: false,
                notes: '',
            })
        }
    }, [cost, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.description) {
            toast({
                title: 'Validasi Error',
                description: 'Nama biaya harus diisi',
                variant: 'destructive',
            })
            return
        }

        if (!formData.amount || formData.amount <= 0) {
            toast({
                title: 'Validasi Error',
                description: 'Jumlah biaya harus lebih dari 0',
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)
        try {
            const url = cost ? `/api/operational-costs/${cost.id}` : '/api/operational-costs'
            const method = cost ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Gagal menyimpan biaya')
            }

            toast({
                title: cost ? 'Biaya diperbarui' : 'Biaya ditambahkan',
                description: `${formData.description} berhasil ${cost ? 'diperbarui' : 'ditambahkan'}`,
            })

            onOpenChange(false)
            onSuccess?.()
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tambah Biaya Operasional' : `Edit ${cost?.description}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="description">Nama Biaya *</Label>
                                <Input
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Contoh: Listrik Bulanan"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={formData.category || 'utilities'}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COST_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Jumlah Biaya *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frekuensi</Label>
                                <Select
                                    value={formData.frequency || 'monthly'}
                                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                                >
                                    <SelectTrigger id="frequency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Harian</SelectItem>
                                        <SelectItem value="weekly">Mingguan</SelectItem>
                                        <SelectItem value="monthly">Bulanan</SelectItem>
                                        <SelectItem value="yearly">Tahunan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Catatan tambahan tentang biaya ini..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="recurring"
                                checked={formData.recurring || false}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, recurring: checked as boolean })
                                }
                            />
                            <Label htmlFor="recurring" className="cursor-pointer">
                                Biaya Tetap (Recurring)
                            </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Centang jika biaya ini bersifat tetap dan berulang setiap periode (contoh: sewa, gaji)
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Tambah Biaya' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
