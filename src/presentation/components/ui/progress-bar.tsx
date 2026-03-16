import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

interface ProgressBarProps {
  value: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(value, 100)

  const barColor =
    value >= 100
      ? 'bg-danger'
      : value >= 80
        ? 'bg-warning'
        : 'bg-success'

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-end">
          <span
            className={cn(
              'text-xs font-semibold tabular-nums',
              value >= 100 ? 'text-danger' : value >= 80 ? 'text-warning' : 'text-success',
            )}
          >
            {Math.round(value)}%
          </span>
        </div>
      )}

      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(value)}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            barColor,
          )}
          style={{ width: `${clamped}%`, minWidth: clamped > 0 ? '4px' : '0' }}
        />
      </div>
    </div>
  )
}
