'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react'
import { format, addMonths, subMonths, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppState } from '@/presentation/providers'
import { Button } from '@/presentation/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, dispatch } = useAppState()

  // Parse current month from searchParam or context state
  const monthParam = searchParams.get('month') ?? state.selectedMonth
  const currentDate = parse(monthParam, 'yyyy-MM', new Date())

  const formattedMonth = format(currentDate, "MMMM yyyy", { locale: ptBR })
  const capitalizedMonth =
    formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

  function navigateMonth(direction: 'prev' | 'next') {
    const newDate =
      direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
    const newMonth = format(newDate, 'yyyy-MM')
    dispatch({ type: 'SET_MONTH', payload: newMonth })
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    router.push(`?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 md:px-6 dark:bg-gray-900/95 dark:border-gray-800">
      {/* Mobile menu button */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="flex md:hidden items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
        )}
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        <button
          onClick={() => navigateMonth('prev')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-28 text-center text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
          {capitalizedMonth}
        </span>
        <button
          onClick={() => navigateMonth('next')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* New transaction button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => dispatch({ type: 'OPEN_NEW_TRANSACTION' })}
        className="hidden sm:inline-flex gap-1.5"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">Nova Transação</span>
        <span className="md:hidden">Nova</span>
      </Button>

      {/* Mobile-only icon button */}
      <button
        onClick={() => dispatch({ type: 'OPEN_NEW_TRANSACTION' })}
        className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Nova transação"
      >
        <Plus className="h-5 w-5" />
      </button>
    </header>
  )
}
