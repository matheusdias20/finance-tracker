import { Suspense } from 'react'
import { format } from 'date-fns'
import { TransactionsHeader } from '@/presentation/components/transactions/transactions-header'
import { TransactionsClient } from '@/presentation/components/transactions/transactions-client'
import { Skeleton } from '@/presentation/components/ui'

interface TransactionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getTransactionsData(params: TransactionsPageProps['searchParams']) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const query = new URLSearchParams()
  
  if (params.month) query.append('month', params.month as string)
  else query.append('month', format(new Date(), 'yyyy-MM'))
  
  if (params.type) query.append('type', params.type as string)
  if (params.categoryId) query.append('categoryId', params.categoryId as string)
  if (params.search) query.append('search', params.search as string)
  query.append('page', (params.page as string) || '1')
  query.append('limit', '10')

  const [transactionsRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/api/transactions?${query.toString()}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/categories`, { cache: 'no-store' })
  ])

  const [transactions, categories] = await Promise.all([
    transactionsRes.json(),
    categoriesRes.json()
  ])

  return {
    transactions: transactions?.success ? transactions.data : { data: [], total: 0, pages: 0 },
    categories: categories?.success ? categories.data : []
  }
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const data = await getTransactionsData(searchParams)

  return (
    <div className="space-y-6">
      <TransactionsHeader />
      
      <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}>
        <TransactionsClient 
          initialData={data.transactions} 
          categories={data.categories} 
        />
      </Suspense>
    </div>
  )
}
