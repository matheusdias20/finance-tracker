'use client'

import { 
  Card, 
  CardContent, 
  CardFooter,
  Button,
  Badge,
  ProgressBar,
  LucideIcon
} from '@/presentation/components/ui'
import { formatCurrency } from '@/presentation/lib/format'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  budgetLimit: number | null
  type: 'income' | 'expense'
}

interface BudgetWithSpent {
  categoryId: string
  limitAmount: number
  spentAmount: number
  percentageUsed: number
  isExceeded: boolean
}

interface CategoryCardProps {
  category: Category
  budget?: BudgetWithSpent | null
  onEdit: () => void
  onDelete: () => void
  onDefineBudget: () => void
}

export function CategoryCard({ category, budget, onEdit, onDelete, onDefineBudget }: CategoryCardProps) {
  const hasBudget = !!budget || category.budgetLimit !== null
  const limit = budget?.limitAmount ?? category.budgetLimit ?? 0
  const spent = budget?.spentAmount ?? 0
  const percentage = budget?.percentageUsed ?? (limit > 0 ? (spent / limit) * 100 : 0)
  
  const isExceeded = percentage >= 100
  const isWarning = percentage >= 85 && percentage < 100

  const statusBadge = () => {
    if (!hasBudget || limit === 0) return null
    if (isExceeded) return <Badge variant="danger">Excedido</Badge>
    if (isWarning) return <Badge variant="warning">Atenção</Badge>
    return <Badge variant="success">Dentro do limite</Badge>
  }

  return (
    <Card 
      className="overflow-hidden border-l-4 min-h-[180px] flex flex-col" 
      style={{ borderLeftColor: category.color }}
    >
      <CardContent className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              <LucideIcon name={category.icon} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-none">{category.name}</h3>
              <span className="text-xs text-gray-500 capitalize">{category.type === 'income' ? 'Receita' : 'Despesa'}</span>
            </div>
          </div>
          {statusBadge()}
        </div>

        <div className="space-y-3">
          {category.type === 'expense' ? (
            <>
              {hasBudget && limit > 0 ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{formatCurrency(spent)} gastos</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Meta: {formatCurrency(limit)}</span>
                  </div>
                  <ProgressBar 
                    value={percentage} 
                  />
                </>
              ) : (
                <button 
                  onClick={onDefineBudget}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <Plus className="h-3 w-3" />
                  Definir orçamento mensal
                </button>
              )}
            </>
          ) : (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{formatCurrency(spent)} receitas</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 mt-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border"
          onClick={onEdit}
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-red-500 hover:text-red-600 border"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  )
}
