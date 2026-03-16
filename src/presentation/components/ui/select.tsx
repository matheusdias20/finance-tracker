'use client'

import { cn } from '@/presentation/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  error?: string | undefined
  disabled?: boolean
  className?: string
}

export function Select({
  label, value, onChange, options,
  placeholder = 'Selecione...', error, disabled, className
}: SelectProps) {
  const selectId = `select-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label 
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'h-10 w-full rounded-md border bg-white px-3 text-sm transition-colors',
          'text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary',
          'dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800',
          error
            ? 'border-danger focus:ring-danger'
            : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-danger mt-1">{error}</p>
      )}
    </div>
  )
}
