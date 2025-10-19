import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useResponsive } from '@/hooks/use-mobile'
import { Users } from 'lucide-react'

export function CustomerTips() {
  const { isMobile } = useResponsive()

  return (
    <Alert>
      <AlertDescription>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              💡 Tips: Manfaatkan Data Pelanggan
            </h3>
            <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex flex-wrap gap-4'}`}>
              <span>• Lacak riwayat pembelian</span>
              <span>• Analisa pelanggan terbaik</span>
              <span>• Personalisasi penawaran</span>
              <span>• Follow up order berkala</span>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
