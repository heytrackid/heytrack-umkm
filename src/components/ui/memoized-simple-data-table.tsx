import { memo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CellValue = boolean | number | string | null | undefined

interface SimpleDataTableProps {
  headers: string[]
  data: CellValue[][]
  title?: string
  description?: string
}

const SimpleDataTableComponent = ({ headers, data, title, description }: SimpleDataTableProps) => (
    <Card>
      {(title !== null || description !== null) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {headers.map((header, index) => (
                  <th key={index} className="text-left py-2 px-4 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-b-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-2 px-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

export const MemoizedSimpleDataTable = memo(SimpleDataTableComponent)

// Properly set the displayName to help with debugging
MemoizedSimpleDataTable.displayName = 'MemoizedSimpleDataTable'