import { Suspense } from 'react'
import { format } from 'date-fns'
import { DashboardHeader } from '@/presentation/components/dashboard/dashboard-header'
import { MetricsSection } from '@/presentation/components/dashboard/metrics-section'
import { CategoryChart } from '@/presentation/components/dashboard/category-chart'
import { RecentTransactions } from '@/presentation/components/dashboard/recent-transactions'
import { BudgetOverview } from '@/presentation/components/dashboard/budget-overview'
import { TransactionModal } from '@/presentation/components/dashboard/transaction-modal'
import { SkeletonMetric, SkeletonCard, SkeletonChart } from '@/presentation/components/ui'

// Force dynamic ensures we don't cache the page statically
export const dynamic = 'force-dynamic'

interface DashboardPageProps {
  searchParams: {
    month?: string
  }
}

/**
 * Fetches data from internal APIs. 
 * We use absolute URLs in server components for fetch if needed, 
 * but Next.js supports relative URLs in some cases or we can use the app URL env var.
 */
async function getDashboardData(month: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const [txRes, reportRes, budgetsRes] = await Promise.all([
    fetch(`${baseUrl}/api/transactions?month=${month}&limit=8`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/reports/by-category?month=${month}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/budgets?month=${month}`, { cache: 'no-store' })
  ])

  const [transactions, report, budgets] = await Promise.all([
    txRes.json(),
    reportRes.json(),
    budgetsRes.json()
  ])

  return {
    transactions: transactions?.success ? (transactions.data?.items ?? []) : [],
    report: report?.success ? (report.data ?? []) : [],
    budgets: budgets?.success ? (budgets.data ?? []) : []
  }
}

interface ReportItem {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  totalAmount: number
  transactionCount: number
}

interface DashboardTransaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const currentMonth = searchParams.month || format(new Date(), 'yyyy-MM')
  const { transactions, report, budgets } = await getDashboardData(currentMonth)

  // Calculate metrics from report and transactions with defensive checks
  const expenses = Array.isArray(report) 
    ? (report as ReportItem[]).reduce((acc: number, curr: ReportItem) => acc + (curr.totalAmount || 0), 0)
    : 0
  
  const income = Array.isArray(transactions)
    ? (transactions as DashboardTransaction[])
        .filter((t: DashboardTransaction) => t?.type === 'INCOME')
        .reduce((acc: number, curr: DashboardTransaction) => acc + (curr.amount || 0), 0)
    : 0

  const topCategory = Array.isArray(report) && report.length > 0 
    ? {
        name: (report as ReportItem[])[0].categoryName,
        totalAmount: (report as ReportItem[])[0].totalAmount
      } 
    : null

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-gray-100 bg-white dark:bg-gray-900" />}>
        <DashboardHeader />
      </Suspense>

      <div className="space-y-4">
        {/* Metrics Row */}
        <Suspense fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonMetric /><SkeletonMetric /><SkeletonMetric /><SkeletonMetric />
          </div>
        }>
          <MetricsSection 
            income={income} 
            expense={expenses} 
            topCategory={topCategory} 
          />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Column (8/12) */}
          <div className="lg:col-span-8 space-y-4">
            <Suspense fallback={<SkeletonChart />}>
              <CategoryChart data={report} />
            </Suspense>

            <Suspense fallback={<SkeletonCard height="h-64" />}>
              <BudgetOverview budgets={budgets} />
            </Suspense>
          </div>

          {/* Side Column (4/12) */}
          <aside className="lg:col-span-4 h-full">
            <Suspense fallback={<SkeletonCard height="h-[600px]" />}>
              <RecentTransactions 
                transactions={transactions} 
                month={currentMonth} 
              />
            </Suspense>
          </aside>
        </div>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal />
    </>
  )
}
