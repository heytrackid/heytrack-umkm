'use client'

import { Loader2 } from '@/components/icons'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { useCreateOperationalCost, useUpdateOperationalCost } from '@/hooks/useOperationalCosts'

import type { Row, Insert } from '@/types/database'


type OperationalCost = Row<'operational_costs'>

interface ApiErrorPayload {
    error?: string
}

const isApiErrorPayload = (value: unknown): value is ApiErrorPayload => {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const { error } = value as { error?: unknown }
    return error === undefined || typeof error === 'string'
}

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

    const mode = cost ? 'edit' : 'create'
    const createMutation = useCreateOperationalCost()
    const updateMutation = useUpdateOperationalCost()
    const isSubmitting = createMutation.isPending || updateMutation.isPending

    const [formData, setFormData] = useState<Partial<Insert<'operational_costs'>>>(() => {
        return cost || {
            description: '',
            category: 'utilities',
            amount: 0,
            frequency: 'monthly',
            recurring: false,
            notes: '',
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.description) {
            toast.error('Nama biaya harus diisi')
            return
        }

        if (!formData.amount || formData.amount <= 0) {
            toast.error('Jumlah biaya harus lebih dari 0')
            return
        }

        try {
            if (cost) {
                // Update existing cost
                await updateMutation.mutateAsync({
                    id: cost.id,
                    data: formData as never
                })
            } else {
                // Create new cost
                await createMutation.mutateAsync(formData as never)
            }

            toast.success(`${formData.description} berhasil ${cost ? 'diperbarui' : 'ditambahkan'}`)

            onOpenChange(false)
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
        }
    }

    return (
        <Dialog key={cost?.id || 'new'} open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                    value={formData.description ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Contoh: Listrik Bulanan"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={formData.category ?? 'utilities'}
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
                                    step="1"
                                    value={formData.amount ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, amount: parseFloat(e.target.value.replace(',', '.')) || 0 })}
                                    placeholder="0"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frekuensi</Label>
                                <Select
                                    value={formData.frequency ?? 'monthly'}
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
                                value={formData.notes ?? ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Catatan tambahan tentang biaya ini..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="recurring"
                                checked={formData.recurring ?? false}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, recurring: Boolean(checked) })
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
