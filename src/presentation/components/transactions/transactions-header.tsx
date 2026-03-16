'use client'

import { Plus } from 'lucide-react'
import { useAppState } from '@/presentation/providers'
import { Button, PageHeader } from '@/presentation/components/ui'

export function TransactionsHeader() {
  const { dispatch } = useAppState()

  return (
    <PageHeader
      title="Transações"
      subtitle="Gerencie e filtre todo o seu histórico financeiro."
      actions={
        <Button 
          variant="primary"
          onClick={() => dispatch({ type: 'OPEN_NEW_TRANSACTION' })}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Transação</span>
        </Button>
      }
    />
  )
}
