"use client"

import { endOfMonth, format, startOfMonth, startOfYear, subDays, subMonths } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type DateRangePreset = {
  label: string
  value: string
  getRange: () => DateRange
}

const defaultPresets: DateRangePreset[] = [
  {
    label: "Hari Ini",
    value: "today",
    getRange: () => {
      const today = new Date()
      return { from: today, to: today }
    },
  },
  {
    label: "7 Hari Terakhir",
    value: "7days",
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "30 Hari Terakhir",
    value: "30days",
    getRange: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "Bulan Ini",
    value: "thisMonth",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Bulan Lalu",
    value: "lastMonth",
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }
    },
  },
  {
    label: "Tahun Ini",
    value: "thisYear",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
]

interface DateRangePickerProps {
  value?: DateRange | undefined
  onChange?: (range: DateRange | undefined) => void
  presets?: DateRangePreset[]
  showPresets?: boolean
  placeholder?: string
  className?: string
  align?: "start" | "center" | "end"
  disabled?: boolean
  numberOfMonths?: number
}

export function DateRangePicker({
  value,
  onChange,
  presets = defaultPresets,
  showPresets = true,
  placeholder = "Pilih rentang tanggal",
  className,
  align = "start",
  disabled = false,
  numberOfMonths,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<string>("")

  // Responsive: 1 month on mobile, 2 on desktop
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const months = numberOfMonths ?? (isMobile ? 1 : 2)

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue)
    const preset = presets.find((p) => p.value === presetValue)
    if (preset) {
      onChange?.(preset.getRange())
    }
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedPreset("")
    onChange?.(range)
  }

  const formatDateRange = () => {
    if (!value?.from) return placeholder
    
    if (value.to) {
      if (isMobile) {
        return `${format(value.from, "dd/MM/yy")} - ${format(value.to, "dd/MM/yy")}`
      }
      return `${format(value.from, "dd MMM yyyy", { locale: id })} - ${format(value.to, "dd MMM yyyy", { locale: id })}`
    }
    
    return format(value.from, "dd MMM yyyy", { locale: id })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal sm:w-[280px] md:w-[300px]",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{formatDateRange()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align={align}
          sideOffset={4}
        >
          <div className="flex flex-col sm:flex-row">
            {showPresets && (
              <div className="border-b sm:border-b-0 sm:border-r sm:w-[160px] bg-muted/30 p-3">
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-full sm:hidden mb-2">
                    <SelectValue placeholder="Pilih preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="hidden sm:flex sm:flex-col sm:gap-1">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Preset</div>
                  {presets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={selectedPreset === preset.value ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs font-normal",
                        selectedPreset === preset.value && "font-medium"
                      )}
                      onClick={() => handlePresetChange(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3">
              <Calendar
                mode="range"
                {...(value?.from && { defaultMonth: value.from })}
                selected={value}
                onSelect={handleDateSelect}
                numberOfMonths={months}
                locale={id}
              />
            </div>
          </div>
          <div className="border-t p-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(undefined)
                setSelectedPreset("")
              }}
            >
              Reset
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Terapkan
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Simple single date picker
interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal sm:w-[200px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd MMM yyyy", { locale: id }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
          locale={id}
        />
      </PopoverContent>
    </Popover>
  )
}

export { type DateRange }
