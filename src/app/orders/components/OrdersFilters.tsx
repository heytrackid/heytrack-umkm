'use client'


import { Search } from '@/components/icons'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'



interface OrdersFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  statusConfig: Record<string, { label: string; color: string }>
}

const OrdersFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusConfig,
  // _t not used
}: OrdersFiltersProps): JSX.Element => (
  <Card>
    <CardContent className="p-6">
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder=""
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Informasi</SelectItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


      </div>
    </CardContent>
  </Card>
)

export { OrdersFilters }