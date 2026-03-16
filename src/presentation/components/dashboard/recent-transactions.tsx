'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LucideIcon } from '@/presentation/components/ui/lucide-icon'
import { formatCurrency } from '@/presentation/lib/format'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  month: string
}

export function RecentTransactions({ transactions, month }: RecentTransactionsProps) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Transações recentes
        </h3>
        <Link
          href={`/transactions?month=${month}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma transação este mês
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${tx.categoryColor}20` }}
                  >
                    <LucideIcon 
                      name={tx.categoryIcon} 
                      size={18} 
                      style={{ color: tx.categoryColor }} 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.categoryName} • {format(new Date(tx.date), 'dd/MM', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <p 
                  className={cn(
                    'text-sm font-bold tabular-nums',
                    tx.type === 'INCOME' ? 'text-success' : 'text-danger'
                  )}
                >
                  {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(tx.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
