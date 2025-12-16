'use client'

import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
// import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type HppExportFormat = 'csv' | 'excel' | 'json' | 'pdf'
type HppExportMetric = 'alerts' | 'cost_breakdown' | 'hpp' | 'margin' | 'recommendations' | 'trends'

type ExportFormat = HppExportFormat
type ExportMetric = HppExportMetric

interface ReportConfig {
  dateRange: {
    start: string
    end: string
  }
  recipeIds: string[]
  metrics: ExportMetric[]
  format: ExportFormat
  includeCharts: boolean
}

interface ReportsTabContentProps {
  config: ReportConfig
  setConfig: React.Dispatch<React.SetStateAction<ReportConfig>>
  generateReport: () => Promise<void>
  generating: boolean
}

const ReportsTabContent = ({ config, setConfig, generateReport, generating }: ReportsTabContentProps): JSX.Element => (
    <Card>
      <CardHeader>
        <CardTitle>Report Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
       {/* Metrics */}
      <div className="space-y-2">
        <Label>Metrics to Include</Label>
        <div className="grid grid-cols-2 grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { value: 'hpp' as const, label: 'HPP Values' },
            { value: 'margin' as const, label: 'Margins' },
            { value: 'cost_breakdown' as const, label: 'Cost Breakdown' },
            { value: 'trends' as const, label: 'Trends' },
            { value: 'recommendations' as const, label: 'Recommendations' },
            { value: 'alerts' as const, label: 'Alerts' }
          ].map((metric) => (
            <div key={metric.value} className="flex flex-col sm:flex-row sm:items-center space-x-2">
              <Checkbox
                id={`metric-${metric.value}`}
                checked={config.metrics.includes(metric.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setConfig(prev => ({
                      ...prev,
                      metrics: [...prev.metrics, metric.value]
                    }))
                  } else {
                    setConfig(prev => ({
                      ...prev,
                      metrics: prev.metrics.filter(m => m !== metric.value)
                    }))
                  }
                }}
              />
              <Label htmlFor={`metric-${metric.value}`} className="text-sm">
                {metric.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="space-y-2">
        <Label htmlFor="format">Report Format</Label>
        <Select
          value={config.format}
          onValueChange={(value: ExportFormat) => setConfig(prev => ({ ...prev, format: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Include Charts */}
      <div className="flex flex-col sm:flex-row sm:items-center space-x-2">
        <Checkbox
          id="include-charts"
          checked={config.includeCharts}
          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeCharts: Boolean(checked) }))}
        />
        <Label htmlFor="include-charts">Include Charts in Report</Label>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateReport}
        disabled={generating}
        className="w-full"
      >
        {generating ? 'Generating Report...' : 'Generate Report'}
      </Button>
    </CardContent>
  </Card>
)

export { ReportsTabContent }
