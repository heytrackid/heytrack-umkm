'use client'

import { useState, useCallback } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'

export function OneClickHppGenerator(): JSX.Element {
  const [vertical, setVertical] = useState<'fnb'|'beauty'|'fashion'|'services'|'general'>('fnb')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle'|'calling-ai'|'seeding'|'calculating'>('idle')
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
      console.error('Auth check failed:', authError)
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
      console.log('Bootstrap request:', { businessDescription: content.substring(0, 50) + '...', vertical })

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
        console.error('Failed to parse response:', parseError)
        throw new Error(`Server error (${res.status}): Invalid response format`)
      }

      if (!res.ok) {
        console.error('API Error:', { status: res.status, data })
        throw new Error(data.error || data.message || `HTTP ${res.status}: ${res.statusText}`)
      }

      setStep('calculating')
      toast({
        title: 'Berhasil!',
        description: `Dibuat ${data.ingredientCount || 0} bahan & ${data.recipeIds?.length || 0} resep.`
      })
    } catch (e) {
      console.error('Bootstrap generation failed:', e)
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
  }, [desc, vertical, toast])

  return (
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
  )
}
