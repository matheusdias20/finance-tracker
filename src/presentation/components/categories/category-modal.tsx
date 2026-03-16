'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Modal,
  Button,
  Input,
} from '@/presentation/components/ui'
import { IconPicker } from './icon-picker'
import { ColorPicker } from './color-picker'
import { createCategorySchema } from '@/shared/schemas/category.schema'
import type { CreateCategoryInput } from '@/shared/schemas/category.schema'
import { cn } from '@/presentation/lib/utils'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  budgetLimit: number | null
  type: 'income' | 'expense'
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!category

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: 'Package',
      color: '#3498DB',
      budgetLimit: null,
    }
  })

  const formIcon = watch('icon')
  const formColor = watch('color')
  const formType = watch('type')
  const formName = watch('name')
  const formBudgetLimit = watch('budgetLimit')

  useEffect(() => {
    if (category && isOpen) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        budgetLimit: category.budgetLimit,
      })
    } else if (!category && isOpen) {
      reset({
        name: '',
        type: 'expense',
        icon: 'Package',
        color: '#3498DB',
        budgetLimit: null,
      })
    }
  }, [category, isOpen, reset])

  const onSubmit = async (data: CreateCategoryInput) => {
    setLoading(true)
    try {
      const url = isEditing ? `/api/categories/${category.id}` : '/api/categories'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Nome"
            name="name"
            value={formName}
            onChange={(val) => setValue('name', val, { shouldValidate: true })}
            placeholder="Ex: Alimentação, Lazer..."
            error={errors.name?.message}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setValue('type', 'income')}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
                  formType === 'income'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                )}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setValue('type', 'expense')}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
                  formType === 'expense'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                )}
              >
                Despesa
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ícone</label>
            <IconPicker
              value={formIcon}
              onChange={(icon) => setValue('icon', icon)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
            <ColorPicker
              value={formColor}
              onChange={(color) => setValue('color', color)}
            />
          </div>

          <Input
            label="Orçamento Mensal (Opcional)"
            name="budgetLimit"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formBudgetLimit || ''}
            onChange={(val) => setValue('budgetLimit', val === '' ? null : parseFloat(val))}
            icon={<span className="text-gray-500 text-sm">R$</span>}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            variant="ghost" 
            type="button" 
            className="flex-1"
            onClick={onClose} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            loading={loading}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
