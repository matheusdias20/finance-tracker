'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect, useCallback } from 'react'
import { Input, Select, Button, LucideIcon } from '@/presentation/components/ui'
import { useDebounce } from '@/presentation/lib/hooks'

interface FiltersBarProps {
  categories: Array<{ id: string; name: string }>
}

export function FiltersBar({ categories }: FiltersBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  
  const defaultMonth = new Date().toISOString().slice(0, 7) // "2026-03"

  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 on filter change
    if (updates.page === undefined) {
       params.set('page', '1')
    }

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }, [searchParams, router, startTransition])

  // Initialize month if not present
  useEffect(() => {
    if (!searchParams.get('month')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('month', defaultMonth)
      router.replace(`?${params.toString()}`)
    }
  }, [searchParams, router, defaultMonth, updateFilters])

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 300)

  // Sync search with URL
  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('search') || '')) {
      updateFilters({ search: debouncedSearch })
    }
  }, [debouncedSearch, searchParams, updateFilters])

  const hasActiveFilters = searchParams.has('type') || searchParams.has('categoryId') || searchParams.has('search') || searchParams.has('month')

  return (
    <div className="flex flex-col md:flex-row items-end gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="w-full md:w-44">
        <Input 
          type="month" 
          label="Mês"
          name="month"
          value={searchParams.get('month') ?? defaultMonth}
          onChange={(val) => updateFilters({ month: val })}
        />
      </div>

      <div className="w-full md:w-44">
        <Select 
          label="Tipo"
          value={searchParams.get('type') || ''}
          onChange={(val) => updateFilters({ type: val })}
          options={[
            { value: '', label: 'Todos' },
            { value: 'income', label: 'Receitas' },
            { value: 'expense', label: 'Despesas' },
          ]}
        />
      </div>

      <div className="w-full md:w-56">
        <Select 
          label="Categoria"
          value={searchParams.get('categoryId') || ''}
          onChange={(val) => updateFilters({ categoryId: val })}
          options={[
            { value: '', label: 'Todas as categorias' },
            ...categories.map(c => ({ value: c.id, label: c.name }))
          ]}
        />
      </div>

      <div className="flex-1 w-full md:min-w-[300px]">
        <Input 
          label="Buscar"
          name="search"
          placeholder="Pesquisar por descrição..."
          value={search}
          onChange={setSearch}
          icon={<LucideIcon name="search" size={18} className="text-gray-400" />}
        />
      </div>

      {hasActiveFilters && (
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => {
            setSearch('')
            router.push('/transactions')
          }}
          className="h-10 text-gray-500 hover:text-danger hover:border-danger transition-colors"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
