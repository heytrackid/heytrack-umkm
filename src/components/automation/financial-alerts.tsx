import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface FinancialAlert {
  type: 'danger' | 'warning'
  message: string
  action: string
}

interface FinancialAlertsProps {
  alerts: FinancialAlert[]
}

export function FinancialAlerts({ alerts }: FinancialAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <Alert key={index} className={`${
          alert.type === 'danger' ? 'border-red-200 bg-gray-100 dark:bg-gray-800' : 'border-yellow-200 bg-gray-100 dark:bg-gray-800'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            alert.type === 'danger' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <AlertDescription className={
            alert.type === 'danger' ? 'text-red-700' : 'text-yellow-700'
          }>
            <strong>{alert.message}</strong><br />
            {alert.action}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
