'use client'

import { useState, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { createClientLogger } from '@/lib/client-logger'

export function OneClickHppGenerator(): JSX.Element {
  const logger = createClientLogger('OneClickHppGenerator')
  const [vertical, setVertical] = useState<'fnb'|'beauty'|'fashion'|'services'|'general'>('fnb')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle'|'calling-ai'|'seeding'|'calculating'>('idle')
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [generationResult, setGenerationResult] = useState<{
    ingredientCount: number
    recipeCount: number
    recipeIds: string[]
  } | null>(null)
  const { toast } = useToast()

  const handleGenerate = useCallback(async () => {
    const content = desc.trim()
    if (!content) {
      toast({ title: 'Deskripsi belum diisi', description: 'Tuliskan deskripsi bisnis Anda.' })
      return
    }
    if (content.length < 10) {
      toast({ title: 'Deskripsi terlalu pendek', description: 'Tuliskan minimal 10 karakter deskripsi bisnis Anda.' })
      return
    }

    // Check authentication
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        toast({
          title: 'Authentication Required',
          description: 'Silakan login terlebih dahulu untuk menggunakan fitur ini.',
          variant: 'destructive'
        })
        return
      }
    } catch (authError) {
      logger.error({ authError }, 'Authentication check failed')
      toast({
        title: 'Authentication Error',
        description: 'Gagal memverifikasi autentikasi. Silakan coba lagi.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      setStep('calling-ai')

      // Log request for debugging
      logger.info({
        message: 'Starting bootstrap generation',
        businessDescription: content.substring(0, 50) + '...',
        vertical,
        contentLength: content.length
      })

      const res = await fetch('/api/ai/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ensure credentials are included for authentication
          'credentials': 'include'
        },
        body: JSON.stringify({
          businessDescription: content,
          vertical,
          currency: 'IDR' // Explicitly set currency
        })
      })

      setStep('seeding')

      let data
      try {
        data = await res.json()
      } catch (parseError) {
        logger.error({ parseError, status: res.status }, 'Failed to parse API response')
        throw new Error(`Server error (${res.status}): Invalid response format`)
      }

      if (!res.ok) {
        logger.error({
          status: res.status,
          data,
          requestData: { businessDescription: content.substring(0, 50) + '...', vertical }
        }, 'API request failed')

        // Show detailed validation errors if available
        if (data.code === 'VALIDATION_ERROR' && data.details?.issues) {
          const issues = data.details.issues.map((issue: any) =>
            `${issue.path?.join('.') || 'unknown'}: ${issue.message}`
          ).join('; ')
          throw new Error(`Validasi gagal: ${issues}`)
        }

        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`)
      }

      setStep('calculating')
      logger.info({
        ingredientCount: data.ingredientCount || 0,
        recipeCount: data.recipeIds?.length || 0
      }, 'Bootstrap generation successful')

      // Store results for success dialog
      setGenerationResult({
        ingredientCount: data.ingredientCount || 0,
        recipeCount: data.recipeIds?.length || 0,
        recipeIds: data.recipeIds || []
      })
      setSuccessDialogOpen(true)

      toast({
        title: 'Berhasil!',
        description: `Dibuat ${data.ingredientCount || 0} bahan & ${data.recipeIds?.length || 0} resep.`
      })
    } catch (e) {
      logger.error({
        error: e,
        businessDescription: content.substring(0, 50) + '...',
        vertical
      }, 'Bootstrap generation failed')

      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui'
      toast({
        title: 'Gagal Generate HPP',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }, [desc, vertical, toast, logger])

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Generate HPP 1 Klik</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={vertical} onValueChange={v => setVertical(v as any)}>
          <SelectTrigger><SelectValue placeholder="Pilih industri" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fnb">Food & Beverage (F&B)</SelectItem>
            <SelectItem value="beauty">Beauty / Cosmetics</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
            <SelectItem value="services">Services</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Ceritakan bisnis Anda (contoh: Warung kopi specialty, menu espresso-based, target mahasiswa & karyawan, lokasi Bandung, kapasitas 80 cup/hari, takeaway)"
          rows={4}
        />

        <div className="text-sm text-muted-foreground">
          {step === 'calling-ai' && 'Menghubungi AI untuk menyusun data awal...'}
          {step === 'seeding' && 'Menyimpan bahan, biaya operasional, dan resep...'}
          {step === 'calculating' && 'Menghitung HPP untuk resep yang dibuat...'}
        </div>

        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Menggenerate...' : 'Generate with AI'}
        </Button>
      </CardContent>
    </Card>

    {/* Success Confirmation Dialog */}
    <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            HPP Berhasil Digenerate!
          </DialogTitle>
          <DialogDescription>
            Data bisnis Anda telah berhasil dibuat dan siap digunakan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {generationResult?.ingredientCount}
              </div>
              <div className="text-sm text-muted-foreground">Bahan Baku</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {generationResult?.recipeCount}
              </div>
              <div className="text-sm text-muted-foreground">Resep</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Bahan baku siap digunakan untuk produksi</p>
            <p>• Resep HPP telah dihitung otomatis</p>
            <p>• Biaya operasional telah dikonfigurasi</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSuccessDialogOpen(false)}>
            Tutup
          </Button>
          <Button onClick={() => {
            setSuccessDialogOpen(false)
            // Optional: Navigate to recipes page
            // router.push('/recipes')
          }}>
            Lihat Resep
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
