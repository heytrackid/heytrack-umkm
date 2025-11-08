
interface CustomTooltipProps {
  formatCurrency: (amount: number) => string
}

interface TooltipPayload {
  payload?: {
    name: string
  }
  value?: number
}

const CustomTooltip = ({ formatCurrency }: CustomTooltipProps) => {
  const Component = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{payload[0]?.payload?.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span>Pendapatan: {formatCurrency(payload[1]?.value ?? 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span>Laba: {formatCurrency(payload[2]?.value ?? 0)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  Component.displayName = 'CustomTooltip'
  return Component
}

CustomTooltip.displayName = 'CustomTooltip'

export { CustomTooltip }