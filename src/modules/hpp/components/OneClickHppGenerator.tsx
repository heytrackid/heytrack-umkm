'use client'

import { useState, useCallback } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

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
    setLoading(true)
    try {
      setStep('calling-ai')
      const res = await fetch('/api/ai/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessDescription: content, vertical })
      })
      setStep('seeding')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal generate')
      setStep('calculating')
      toast({ title: 'Berhasil!', description: `Dibuat ${data.ingredientCount} bahan & ${data.recipeIds.length} resep.` })
    } catch (e) {
      toast({ title: 'Gagal', description: e instanceof Error ? e.message : 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
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
