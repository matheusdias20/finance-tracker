import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/presentation/lib/utils'


const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white hover:bg-primary-dark',
          'focus-visible:ring-primary',
          'dark:bg-primary dark:hover:bg-primary-dark',
        ],
        secondary: [
          'bg-white text-primary border border-primary hover:bg-primary-light',
          'focus-visible:ring-primary',
          'dark:bg-transparent dark:text-primary-light dark:border-primary-light dark:hover:bg-primary/10',
        ],
        ghost: [
          'bg-transparent text-gray-700 hover:bg-gray-100',
          'focus-visible:ring-gray-400',
          'dark:text-gray-300 dark:hover:bg-gray-800',
        ],
        danger: [
          'bg-danger text-white hover:bg-red-800',
          'focus-visible:ring-danger',
          'dark:bg-danger dark:hover:bg-red-800',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function Button({
  children,
  variant,
  size,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
