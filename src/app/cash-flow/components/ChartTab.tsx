'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart } from 'lucide-react'

interface ChartTabProps {
  onBack: () => void
  isMobile?: boolean
}

export default function ChartTab({ onBack, isMobile = false }: ChartTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Analisis Grafik</h2>
        <Button variant="outline" onClick={onBack}>
          Kembali ke Overview
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Grafik akan tersedia segera</h3>
          <p className="text-muted-foreground">
            Fitur visualisasi data cash flow dengan chart interaktif sedang dalam pengembangan
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
