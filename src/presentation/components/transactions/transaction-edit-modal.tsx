'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { 
  Modal, 
  Button, 
  Input, 
  Select, 
  type SelectOption,
  LucideIcon 
} from '@/presentation/components/ui'
import { updateTransactionSchema } from '@/shared/schemas/transaction.schema'
import type { z } from 'zod'
import { cn } from '@/presentation/lib/utils'

type TransactionUpdateData = z.input<typeof updateTransactionSchema>

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

interface TransactionEditModalProps {
  transaction: Transaction
  onClose: () => void
  categories: Array<{ id: string; name: string; color: string; icon: string }>
}

export function TransactionEditModal({ transaction, onClose, categories }: TransactionEditModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectOptions: SelectOption[] = categories.map(c => ({
    value: c.id,
    label: c.name,
    icon: c.icon,
    color: c.color
  }))

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionUpdateData>({
    // @ts-expect-error - Complex type mismatch with zod transformations
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      type: transaction.type.toLowerCase() as 'income' | 'expense',
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.split('T')[0],
      categoryId: transaction.categoryId,
    },
  })

  const transactionType = watch('type')

  const onSubmit = async (data: TransactionUpdateData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (json.success) {
        onClose()
        router.refresh()
      } else {
        setError(json.error?.message || 'Erro ao atualizar transação')
      }
    } catch {
      console.error('Update transaction error')
      setError('Erro de conexão com o servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' })
      if (res.ok) {
        onClose()
        router.refresh()
      }
    } catch {
      console.error('Delete error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Editar Transação"
      size="md"
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            type="button"
            onClick={() => setValue('type', 'income')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all',
              transactionType === 'income'
                ? 'bg-white text-success shadow-sm dark:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            <LucideIcon name="trending-up" size={18} />
            Receita
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'expense')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all',
              transactionType === 'expense'
                ? 'bg-white text-danger shadow-sm dark:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            <LucideIcon name="trending-down" size={18} />
            Despesa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                label="Valor (R$)"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={field.value || ''}
                onChange={(val) => field.onChange(parseFloat(val) || 0)}
                error={errors.amount?.message as string | undefined}
                required
              />
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input
                label="Data"
                name="date"
                type="date"
                value={field.value as string}
                onChange={field.onChange}
                error={errors.date?.message as string | undefined}
                required
              />
            )}
          />
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              label="Descrição"
              name="description"
              placeholder="Ex: Aluguel, Supermercado..."
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message as string | undefined}
              required
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              label="Categoria"
              value={field.value ?? ''}
              onChange={field.onChange}
              options={selectOptions}
              placeholder="Selecione uma categoria"
              error={errors.categoryId?.message as string | undefined}
            />
          )}
        />

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
           <Button
            type="button"
            variant="ghost"
            className="order-2 sm:order-1 text-danger hover:bg-danger/10"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isSubmitting}
          >
            Excluir
          </Button>
          <div className="flex flex-1 gap-3 order-1 sm:order-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={isSubmitting}
              disabled={isDeleting}
            >
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
