'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save } from 'lucide-react'
import type { Database } from '@/types/supabase-generated'

type OperationalCost = Database['public']['Tables']['operational_costs']['Row']
type OperationalCostInsert = Database['public']['Tables']['operational_costs']['Insert']

interface OperationalCostFormPageProps {
    mode: 'create' | 'edit'
    costId?: string
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

export const OperationalCostFormPage = ({ mode, costId }: OperationalCostFormPageProps) => {
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()
    const { create, update } = useSupabaseCRUD('operational_costs')

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<OperationalCostInsert>>({
        description: '',
        category: 'utilities',
        amount: 0,
        frequency: 'monthly',
        recurring: false,
        notes: '',
    })

    useEffect(() => {
        if (mode === 'edit' && costId) {
            loadCost()
        }
    }, [mode, costId])

    const loadCost = async () => {
        if (!costId) {return}

        try {
            setLoading(true)
            const { data: cost } = await supabase
                .from('operational_costs')
                .select('*')
                .eq('id', costId)
                .single()
            
            if (cost) {
                setFormData(cost)
            } else {
                throw new Error('Biaya tidak ditemukan')
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal memuat biaya'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
            router.push('/operational-costs')
        } finally {
            setLoading(false)
        }
    }

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

        try {
            setLoading(true)

            if (mode === 'create') {
                await create(formData as OperationalCostInsert)
            } else if (costId) {
                await update(costId, formData)
            }

            toast({
                title: mode === 'create' ? 'Biaya ditambahkan' : 'Biaya diperbarui',
                description: `${formData.description} berhasil ${mode === 'create' ? 'ditambahkan' : 'diperbarui'}`,
            })

            router.push('/operational-costs')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menyimpan biaya'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={() => router.push('/operational-costs')} className="hover:text-foreground">
                    Biaya Operasional
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">
                    {mode === 'create' ? 'Tambah Biaya Baru' : 'Edit Biaya'}
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/operational-costs')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {mode === 'create' ? 'Tambah Biaya Operasional' : 'Edit Biaya Operasional'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {mode === 'create' ? 'Tambahkan biaya operasional baru' : 'Perbarui informasi biaya'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Biaya</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/operational-costs')}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Biaya' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
