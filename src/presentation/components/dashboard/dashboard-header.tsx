'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addMonths, subMonths, format, parse } from 'date-fns'
import { useAppState } from '@/presentation/providers'
import { Button, PageHeader } from '@/presentation/components/ui'
import { MonthNavigator } from '@/presentation/components/layout/month-navigator'

export function DashboardHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dispatch } = useAppState()

  const currentMonth = searchParams.get('month') || format(new Date(), 'yyyy-MM')
  const currentDate = parse(currentMonth, 'yyyy-MM', new Date())

  function navigateMonth(direction: 'prev' | 'next') {
    const newDate =
      direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
    const newMonth = format(newDate, 'yyyy-MM')
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    router.push(`?${params.toString()}`)
  }

  return (
    <PageHeader
      title="Dashboard"
      subtitle="Acompanhe sua saúde financeira"
      actions={
        <>
          <MonthNavigator
            value={currentMonth}
            onPrev={() => navigateMonth('prev')}
            onNext={() => navigateMonth('next')}
          />
          <Button 
            variant="primary"
            onClick={() => dispatch({ type: 'OPEN_NEW_TRANSACTION' })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Button>
        </>
      }
    />
  )
}
