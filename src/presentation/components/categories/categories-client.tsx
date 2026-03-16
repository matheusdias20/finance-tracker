'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { CategoryCard } from './category-card'
import { CategoryModal } from './category-modal'
import { Input } from '@/presentation/components/ui/input'
import { useRouter } from 'next/navigation'

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

interface CategoriesClientProps {
  initialCategories: Category[]
  initialBudgets: BudgetWithSpent[]
  currentMonth: string
}

export function CategoriesClient({ initialCategories, initialBudgets }: CategoriesClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')

  const handleCreate = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Deseja realmente excluir a categoria "${category.name}"?`)) return

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error?.message || 'Erro ao excluir categoria')
      }
    } catch {
      alert('Erro ao excluir categoria')
    }
  }

  const filteredCategories = initialCategories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  const getBudget = (categoryId: string) => {
    return initialBudgets.find(b => b.categoryId === categoryId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Input 
            label="Buscar"
            name="searchCategories"
            placeholder="Buscar categoria..." 
            value={search}
            onChange={setSearch}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              budget={getBudget(category.id) || null}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category)}
              onDefineBudget={() => handleEdit(category)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nenhuma categoria encontrada</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-1">
            {search ? 'Tente ajustar sua busca.' : 'Comece criando sua primeira categoria para organizar suas finanças.'}
          </p>
          {!search && (
            <Button onClick={handleCreate} variant="secondary" className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Criar Categoria
            </Button>
          )}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
    </div>
  )
}
