import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendsTabProps {
  trends: Array<{ week: string; revenue: number; expenses: number }>
  formatCurrency: (amount: number) => string
}

export function TrendsTab({ trends, formatCurrency }: TrendsTabProps) {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <span className="text-green-500">↗️</span>
    if (current < previous) return <span className="text-red-500">↘️</span>
    return <span className="text-gray-500">→</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📈 Weekly Financial Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((week, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="font-medium">{week.week}</div>
                {index < trends.length - 1 && getTrendIcon(week.revenue, trends[index + 1]?.revenue || 0)}
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(week.revenue)}</div>
                  <div className="text-muted-foreground">Revenue</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(week.expenses)}</div>
                  <div className="text-muted-foreground">Expenses</div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${week.revenue - week.expenses >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {formatCurrency(week.revenue - week.expenses)}
                  </div>
                  <div className="text-muted-foreground">Net</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
