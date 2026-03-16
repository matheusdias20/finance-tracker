import { Suspense } from 'react'
import { format } from 'date-fns'
import { ReportsClient } from '@/presentation/components/reports/reports-client'
import { Skeleton, SkeletonChart, PageHeader } from '@/presentation/components/ui'

export const metadata = {
  title: 'Relatórios',
  description: 'Visualize a evolução das suas finanças e previsões futuras.',
}

async function getReportsData(months: number, currentMonth: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  
  const [evolutionRes, forecastRes, categoryRes] = await Promise.all([
    fetch(`${baseUrl}/api/reports/monthly-evolution?months=${months}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/reports/forecast?months=3`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/reports/by-category?month=${currentMonth}`, { cache: 'no-store' }),
  ])

  const [evolution, forecast, categories] = await Promise.all([
    evolutionRes.json(),
    forecastRes.json(),
    categoryRes.json(),
  ])

  return {
    evolution: evolution?.success ? evolution.data : [],
    forecast: forecast?.success ? forecast.data : [],
    categories: categories?.success ? categories.data : [],
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const monthsParam = typeof searchParams.months === 'string' ? parseInt(searchParams.months, 10) : 12
  const months = !isNaN(monthsParam) ? monthsParam : 12
  const currentMonth = format(new Date(), 'yyyy-MM')

  const data = await getReportsData(months, currentMonth)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios e Projeções"
        subtitle="Análise detalhada da sua saúde financeira e previsões baseadas no seu histórico."
      />

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsClient 
          initialData={data}
          currentMonths={months}
        />
      </Suspense>
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonChart className="h-[400px]" />
          <SkeletonChart className="h-[300px]" />
        </div>
        <div className="space-y-6">
          <SkeletonChart className="h-[500px]" />
        </div>
      </div>
    </div>
  )
}
