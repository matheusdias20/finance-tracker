'use client'

import { Card, CardContent, LucideIcon, ProgressBar } from '@/presentation/components/ui'
import { formatCurrency } from '@/presentation/lib/format'

interface CategoryData {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  totalAmount: number
  percentage: number
}

interface CategorySummaryProps {
  data: CategoryData[]
}

export function CategorySummary({ data }: CategorySummaryProps) {
  const total = data.reduce((acc, curr) => acc + curr.totalAmount, 0)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Resumo do Mês</h3>
          <p className="text-xs text-gray-500">Distribuição por categorias.</p>
        </div>

        {data.length > 0 ? (
          <div className="space-y-5">
            {data.map((item) => (
              <div key={item.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex h-6 w-6 items-center justify-center rounded-md text-white shadow-sm"
                      style={{ backgroundColor: item.categoryColor }}
                    >
                      <LucideIcon name={item.categoryIcon} size={14} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.categoryName}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.totalAmount)}</span>
                </div>
                <ProgressBar value={item.percentage} className="h-1.5" />
              </div>
            ))}

            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            Nenhuma despesa registrada neste mês.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
