'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthNavigatorProps {
  value: string // yyyy-MM
  onPrev: () => void
  onNext: () => void
  disabled?: boolean
}

export function MonthNavigator({ value, onPrev, onNext, disabled }: MonthNavigatorProps) {
  const currentDate = parse(value, 'yyyy-MM', new Date())
  const formattedMonth = format(currentDate, "MMMM yyyy", { locale: ptBR })
  const capitalizedMonth =
    formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-900 shadow-sm">
      <button
        onClick={onPrev}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4.5 w-4.5" />
      </button>
      
      <span className="min-w-[120px] text-center text-sm font-semibold text-gray-700 dark:text-gray-200 select-none px-2">
        {capitalizedMonth}
      </span>
      
      <button
        onClick={onNext}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}
