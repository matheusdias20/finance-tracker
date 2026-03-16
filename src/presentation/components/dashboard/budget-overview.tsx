'use client'

import Link from 'next/link'
import { ProgressBar } from '@/presentation/components/ui/progress-bar'
import { Badge } from '@/presentation/components/ui/badge'
import { LucideIcon } from '@/presentation/components/ui/lucide-icon'
import { formatCurrency } from '@/presentation/lib/format'

interface Budget {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  spent: number
  percentage: number
}

interface BudgetOverviewProps {
  budgets: Budget[]
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  if (budgets.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center dark:bg-primary/20">
            <LucideIcon name="wallet" className="text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Sem orçamentos definidos
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
              Configure metas de gastos para cada categoria e tenha mais controle.
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-primary hover:underline"
          >
            Configurar agora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Metas de gastos
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const isExceeded = budget.percentage >= 100
          const isWarning = budget.percentage >= 80 && !isExceeded

          return (
            <div 
              key={budget.categoryId}
              className="flex flex-col gap-3 p-4 rounded-lg border border-gray-50 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-800/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${budget.categoryColor}20` }}
                  >
                    <LucideIcon 
                      name={budget.categoryIcon} 
                      size={16} 
                      style={{ color: budget.categoryColor }} 
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {budget.categoryName}
                  </span>
                </div>
                <Badge variant={isExceeded ? 'danger' : isWarning ? 'warning' : 'success'}>
                  {isExceeded ? 'Excedido' : isWarning ? 'Atenção' : 'No limite'}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                  <span 
                    className={
                      isExceeded ? 'text-danger font-bold' : isWarning ? 'text-warning font-bold' : 'text-success font-bold'
                    }
                  >
                    {Math.round(budget.percentage)}%
                  </span>
                </div>
                <ProgressBar value={budget.percentage} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
