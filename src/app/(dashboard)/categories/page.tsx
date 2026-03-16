import { Suspense } from 'react'
import { format } from 'date-fns'
import { CategoriesClient } from '@/presentation/components/categories/categories-client'
import { Skeleton, PageHeader } from '@/presentation/components/ui'

export const metadata = {
  title: 'Categorias',
  description: 'Gerencie suas categorias e orçamentos mensais.',
}

async function getCategoriesData(month: string) {
  const [categoriesRes, budgetsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/budgets?month=${month}`, { cache: 'no-store' }),
  ])

  const categories = await categoriesRes.json()
  const budgets = await budgetsRes.json()

  return {
    categories: categories?.success ? categories.data : [],
    budgets: budgets?.success ? budgets.data : [],
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const month = typeof searchParams.month === 'string' ? searchParams.month : currentMonth

  const data = await getCategoriesData(month)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias e Metas"
        subtitle="Gerencie suas categorias e acompanhe o limite de gastos mensal."
      />

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesClient 
          initialCategories={data.categories} 
          initialBudgets={data.budgets}
          currentMonth={month}
        />
      </Suspense>
    </div>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  )
}
