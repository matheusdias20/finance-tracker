import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/presentation/lib/format'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

interface MetricCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: number | null
  trendLabel?: string
  variant?: 'default' | 'success' | 'danger'
  className?: string
}

const variantStyles = {
  default: 'border-gray-100 dark:border-gray-700',
  success: 'border-success/20 bg-success-light dark:border-success/30 dark:bg-success/10',
  danger: 'border-danger/20 bg-danger-light dark:border-danger/30 dark:bg-danger/10',
}

const valueColor = {
  default: 'text-gray-900 dark:text-gray-100',
  success: 'text-success dark:text-green-400',
  danger: 'text-danger dark:text-red-400',
}

export function MetricCard({
  label,
  value,
  prefix = '',
  suffix = '',
  trend = null,
  trendLabel,
  variant = 'default',
  className,
}: MetricCardProps) {
  const formattedValue =
    prefix === 'R$'
      ? formatCurrency(value)
      : suffix === '%'
        ? formatPercent(value)
        : value.toLocaleString('pt-BR')

  const trendPositive = trend !== null && trend > 0
  const trendNegative = trend !== null && trend < 0
  const trendNeutral = trend !== null && trend === 0

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border bg-white p-4',
        'dark:bg-gray-900 shadow-sm',
        variantStyles[variant],
        className,
      )}
    >
      {/* Label */}
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>

      {/* Value */}
      <p className={cn('text-2xl font-bold leading-tight tabular-nums', valueColor[variant])}>
        {formattedValue}
      </p>

      {/* Trend */}
      {trend !== null && (
        <div className="flex items-center gap-1 text-xs font-medium">
          {trendPositive && (
            <>
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-success">+{formatPercent(Math.abs(trend))}</span>
            </>
          )}
          {trendNegative && (
            <>
              <TrendingDown className="h-3.5 w-3.5 text-danger" />
              <span className="text-danger">-{formatPercent(Math.abs(trend))}</span>
            </>
          )}
          {trendNeutral && (
            <>
              <Minus className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-400">0%</span>
            </>
          )}
          {trendLabel && (
            <span className="text-gray-400 ml-0.5">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
