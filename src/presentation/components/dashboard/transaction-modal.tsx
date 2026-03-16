'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/presentation/providers'
import { 
  Modal, 
  Button, 
  Input, 
  Select, 
  type SelectOption,
  LucideIcon 
} from '@/presentation/components/ui'
import { createTransactionSchema } from '@/shared/schemas/transaction.schema'
import type { z } from 'zod'

import { cn } from '@/presentation/lib/utils'

// Use z.input for the form data type (where date is a string)
type TransactionFormData = z.input<typeof createTransactionSchema>

export function TransactionModal() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [categories, setCategories] = useState<SelectOption[]>([])
  const [isLoadingCats, setIsLoadingCats] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    // @ts-expect-error - Zod transformation causes complex type mismatch with react-hook-form
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      categoryId: '',
    },
  })

  const isRecurring = watch('isRecurring')
  const transactionType = watch('type')

  useEffect(() => {
    if (state.isNewTransactionOpen) {
      fetchCategories()
    } else {
      reset()
      setError(null)
    }
  }, [state.isNewTransactionOpen, reset])

  async function fetchCategories() {
    setIsLoadingCats(true)
    try {
      const res = await fetch('/api/categories')
      const json = await res.json()
      if (json.success) {
        interface CatData { id: string; name: string; icon: string; color: string }
        setCategories(
          (json.data as CatData[]).map((c) => ({
            value: c.id,
            label: c.name,
            icon: c.icon,
            color: c.color,
          }))
        )
      }
    } catch {
      console.error('Failed to fetch categories')
    } finally {
      setIsLoadingCats(false)
    }
  }

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (json.success) {
        dispatch({ type: 'CLOSE_NEW_TRANSACTION' })
        router.refresh()
      } else {
        setError(json.error?.message || 'Erro ao criar transação')
      }
    } catch {
      console.error('Submit transaction error')
      setError('Erro de conexão com o servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={state.isNewTransactionOpen}
      onClose={() => dispatch({ type: 'CLOSE_NEW_TRANSACTION' })}
      title="Nova Transação"
      size="md"
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Type Toggle */}
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
              options={categories}
              placeholder="Selecione uma categoria"
              error={errors.categoryId?.message as string | undefined}
              disabled={isLoadingCats}
            />
          )}
        />

        {/* Recurrence Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
              <LucideIcon name="repeat" size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Transação Recorrente</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Repetir automaticamente</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setValue('isRecurring', !isRecurring)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              isRecurring ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                isRecurring ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {isRecurring && (
          <Controller
            name="recurrenceRule.frequency"
            control={control}
            render={({ field }) => (
              <Select
                label="Frequência"
                value={(field.value as string) || ''}
                onChange={field.onChange}
                options={[
                  { value: 'daily', label: 'Diário' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensal' },
                  { value: 'yearly', label: 'Anual' },
                ]}
                error={(errors.recurrenceRule as { frequency?: { message?: string } } | undefined)?.frequency?.message}
              />
            )}
          />
        )}

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => dispatch({ type: 'CLOSE_NEW_TRANSACTION' })}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-2 w-full"
            loading={isSubmitting}
          >
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

