import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/presentation/lib/utils'


interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  name: string
  value?: string | number
  onChange?: (value: string) => void
  error?: string | undefined
  icon?: ReactNode
  className?: string
}

export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  icon,
  disabled,
  className,
  ...rest
}: InputProps) {
  const hasValue = value !== undefined && value !== ''
  const hasError = Boolean(error)

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          {...rest}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder ?? ' '}
          required={required}
          disabled={disabled}
          className={cn(
            'peer block w-full rounded-lg border bg-white px-3 pb-2 pt-5 text-sm text-gray-900',
            'transition-colors duration-150 outline-none',
            'placeholder-transparent',
            'dark:bg-gray-900 dark:text-gray-100',
            icon ? 'pl-10' : 'pl-3',
            hasError
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
              : 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary',
            'dark:border-gray-600 dark:focus:border-primary',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        <label
          htmlFor={name}
          className={cn(
            'absolute left-3 top-3 z-10 origin-left text-sm text-gray-500 pointer-events-none',
            'transition-all duration-150',
            // Floats up when peer has focus or has value
            'peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary',
            hasValue ? 'top-1.5 text-xs' : '',
            hasError ? 'peer-focus:text-danger text-danger' : '',
            icon ? 'left-10' : 'left-3',
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        </label>
      </div>

      {hasError && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-danger">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 3.75a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0v-4zM8 11.5a.875.875 0 110 1.75.875.875 0 010-1.75z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
