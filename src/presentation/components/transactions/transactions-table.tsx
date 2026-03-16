'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  LucideIcon, 
  Badge, 
  Button 
} from '@/presentation/components/ui'
import { formatCurrency } from '@/presentation/lib/format'
import { cn } from '@/presentation/lib/utils'

interface Transaction {
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

interface TransactionsTableProps {
  transactions: Transaction[]
  total: number
  pages: number
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  onEdit: (transaction: Transaction) => void
  categories: Array<{ id: string; name: string; color: string; icon: string }>
}

export function TransactionsTable({ 
  transactions, 
  pages, 
  selectedIds, 
  onSelectAll, 
  onSelectOne,
  onEdit
}: TransactionsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } catch {
      console.error('Delete error')
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center dark:bg-gray-800 mb-4">
          <LucideIcon name="search-x" className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Nenhuma transação encontrada</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tente ajustar seus filtros para encontrar o que procura.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={transactions.length > 0 && selectedIds.length === transactions.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map((t) => {
              const isIncome = t.type === 'INCOME'
              const formattedDate = format(new Date(t.date), "dd 'de' MMM", { locale: ptBR })
              
              return (
                <tr 
                  key={t.id} 
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.tagName !== 'INPUT' && !target.closest('button')) {
                      onEdit(t)
                    }
                  }}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedIds.includes(t.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        onSelectOne(t.id, e.target.checked)
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${t.categoryColor}15` }}
                      >
                        <LucideIcon name={t.categoryIcon} size={16} style={{ color: t.categoryColor }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.categoryName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {t.description}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={isIncome ? 'success' : 'danger'} className="capitalize">
                      {isIncome ? 'Receita' : 'Despesa'}
                    </Badge>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-sm font-bold text-right whitespace-nowrap",
                    isIncome ? "text-success" : "text-danger"
                  )}>
                    {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(t)}
                        className="h-8 w-8 p-0"
                       >
                         <LucideIcon name="edit-2" size={14} />
                       </Button>
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteTransaction(t.id)}
                        className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10"
                       >
                         <LucideIcon name="trash-2" size={14} />
                       </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página <span className="font-semibold text-gray-900 dark:text-gray-100">{currentPage}</span> de {pages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(pages)].map((_, i) => {
                const page = i + 1
                const isCurrent = page === currentPage
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                      isCurrent 
                        ? "bg-primary text-white" 
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={currentPage === pages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
