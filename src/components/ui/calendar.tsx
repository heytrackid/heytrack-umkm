'use client'

import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn('p-4 bg-card border border-border rounded-lg', className)}
    classNames={{
      months: 'flex flex-col sm:flex-row gap-4',
      month: 'space-y-4 w-full',
      caption: 'flex justify-center pt-1 relative items-center',
      caption_label: 'text-sm font-semibold text-foreground',
      nav: 'flex items-center justify-between absolute w-full z-10',
      nav_button: cn(
        buttonVariants({ variant: 'ghost' }),
        'h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground'
      ),
      nav_button_previous: 'left-1',
      nav_button_next: 'right-1',
      table: 'w-full border-collapse',
      head_row: 'grid grid-cols-7',
      head_cell: 'text-muted-foreground font-medium text-center text-xs p-2',
      row: 'grid grid-cols-7 mt-1',
      cell: cn(
        'relative p-0 text-center focus-within:relative focus-within:z-20',
        'first:rounded-l-md last:rounded-r-md'
      ),
      day: cn(
        buttonVariants({ variant: 'ghost' }),
        'h-9 w-9 p-0 font-normal text-sm hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'disabled:opacity-50 disabled:pointer-events-none'
      ),
      day_range_start: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      day_range_end: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      day_today: 'bg-accent text-accent-foreground font-semibold',
      day_outside: 'text-muted-foreground opacity-50 hover:bg-accent/50',
      day_disabled: 'text-muted-foreground opacity-50',
      day_range_middle: 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
      day_hidden: 'invisible',
      ...classNames,
    }}
    components={{
      Chevron: ({ orientation }) => orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
    }}
    {...props}
  />
)

Calendar.displayName = 'Calendar'

export { Calendar }
