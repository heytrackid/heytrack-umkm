import { useState } from 'react'
import { CalendarIcon, Clock } from 'lucide-react'
import { format, addDays, startOfToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface QuickDatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    className?: string
    placeholder?: string
    showPresets?: boolean
    minDate?: Date
    maxDate?: Date
}

const quickPresets = [
    {
        label: 'Hari Ini',
        getValue: () => startOfToday(),
    },
    {
        label: 'Besok',
        getValue: () => addDays(startOfToday(), 1),
    },
    {
        label: 'Lusa',
        getValue: () => addDays(startOfToday(), 2),
    },
    {
        label: '3 Hari Lagi',
        getValue: () => addDays(startOfToday(), 3),
    },
    {
        label: 'Seminggu Lagi',
        getValue: () => addDays(startOfToday(), 7),
    },
]

export const QuickDatePicker = ({
    value,
    onChange,
    className,
    placeholder = 'Pilih tanggal',
    showPresets = true,
    minDate,
    maxDate,
}: QuickDatePickerProps) => {
    const [open, setOpen] = useState(false)

    const handlePresetClick = (preset: typeof quickPresets[0]) => {
        const date = preset.getValue()
        onChange?.(date)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? (
                        format(value, 'PPP', { locale: idLocale })
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {showPresets && (
                        <div className="border-r p-3 space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                <Clock className="h-4 w-4" />
                                Pilihan Cepat
                            </div>
                            {quickPresets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onChange?.(date)
                            setOpen(false)
                        }}
                        disabled={(date) => {
                            if (minDate && date < minDate) { return true }
                            if (maxDate && date > maxDate) { return true }
                            return false
                        }}
                        initialFocus
                        locale={idLocale}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
