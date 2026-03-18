'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ForecastTable } from '@/presentation/components/reports/forecast-table'
import { CategorySummary } from '@/presentation/components/reports/category-summary'
import { cn } from '@/presentation/lib/utils'

const MonthlyBarChart = dynamic(
  () => import('@/presentation/components/reports/monthly-bar-chart').then(mod => mod.MonthlyBarChart),
  { ssr: false }
)
const BalanceAreaChart = dynamic(
  () => import('@/presentation/components/reports/balance-area-chart').then(mod => mod.BalanceAreaChart),
  { ssr: false }
)

interface EvolutionData {
  month: string
  income: number
  expense: number
  balance: number
}

interface ForecastData {
  categoryId: string
  categoryName: string
  predictedAmount: number
  minAmount: number
  maxAmount: number
  confidence: 'high' | 'medium' | 'low'
  lowConfidence: boolean
}

interface CategoryData {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  totalAmount: number
  percentage: number
}

interface ReportsClientProps {
  initialData: {
    evolution: EvolutionData[]
    forecast: ForecastData[]
    categories: CategoryData[]
  }
  currentMonths: number
}

const PERIODS = [
  { id: '3', label: '3 meses', value: 3 },
  { id: '6', label: '6 meses', value: 6 },
  { id: '12', label: '12 meses', value: 12 },
  { id: 'current_year', label: 'Ano atual', value: new Date().getMonth() + 1 },
]

export function ReportsClient({ initialData, currentMonths }: ReportsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (periodId: string, months: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('months', months.toString())
    params.set('period', periodId)
    router.push(`/reports?${params.toString()}`)
  }

  const activePeriod = searchParams.get('period') || (currentMonths === 12 ? '12' : currentMonths.toString())

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 w-fit shadow-sm">
        {PERIODS.map((period) => (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id, period.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activePeriod === period.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <MonthlyBarChart data={initialData.evolution} />
          <BalanceAreaChart data={initialData.evolution} />
          <ForecastTable data={initialData.forecast} />
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          <CategorySummary data={initialData.categories} />
        </div>
      </div>
    </div>
  )
}
