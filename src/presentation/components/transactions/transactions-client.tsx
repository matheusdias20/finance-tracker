'use client'

import { useState } from 'react'
import { FiltersBar } from '@/presentation/components/transactions/filters-bar'
import { TransactionsTable } from '@/presentation/components/transactions/transactions-table'
import { BulkActions } from '@/presentation/components/transactions/bulk-actions'
import { TransactionEditModal } from '@/presentation/components/transactions/transaction-edit-modal'

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

interface TransactionsClientProps {
  initialData: {
    data: Transaction[]
    total: number
    pages: number
  }
  categories: Array<{ id: string; name: string; color: string; icon: string }>
}

export function TransactionsClient({ initialData, categories }: TransactionsClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(initialData.data.map(t => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  return (
    <div className="space-y-6 relative pb-24">
      <FiltersBar categories={categories} />
      
      <TransactionsTable 
        transactions={initialData.data}
        total={initialData.total}
        pages={initialData.pages}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={setEditingTransaction}
        categories={categories}
      />

      {selectedIds.length > 0 && (
        <BulkActions 
          selectedCount={selectedIds.length} 
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
        />
      )}

      {editingTransaction && (
        <TransactionEditModal 
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          categories={categories}
        />
      )}
    </div>
  )
}
