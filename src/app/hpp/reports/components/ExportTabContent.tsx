'use client'

import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type HppExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

type ExportFormat = HppExportFormat

interface ExportTabContentProps {
  exportData: (format: ExportFormat) => void
  isMobile: boolean
}

const formatOptions: Array<{ value: ExportFormat; label: string; icon: typeof Download }> = [
  { value: 'pdf', label: 'PDF Report', icon: Download },
  { value: 'excel', label: 'Excel Spreadsheet', icon: Download },
  { value: 'csv', label: 'CSV Data', icon: Download },
  { value: 'json', label: 'JSON Data', icon: Download }
]

const ExportTabContent = ({ exportData, isMobile }: ExportTabContentProps): JSX.Element => (
  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
    {formatOptions.map((option) => (
      <Card key={option.value} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-6 text-center space-y-4">
          <option.icon className="h-12 w-12 mx-auto text-primary" />
          <div>
            <h3 className="font-semibold">{option.label}</h3>
            <p className="text-sm text-muted-foreground">
              Export data in {option.label.toLowerCase()} format
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => exportData(option.value)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
)

export { ExportTabContent }