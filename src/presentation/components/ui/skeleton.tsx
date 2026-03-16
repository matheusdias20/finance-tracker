import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

interface SkeletonProps {
  className?: string
}

/** Base skeleton with pulse animation */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
      aria-hidden="true"
    />
  )
}

interface SkeletonCardProps {
  height?: string
  className?: string
}

/** Full-width card skeleton */
export function SkeletonCard({ height = 'h-24', className }: SkeletonCardProps) {
  return <Skeleton className={cn('w-full', height, className)} />
}

/** Simulates a metric card layout: small label + large number */
export function SkeletonMetric({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-2 rounded-xl border border-gray-100 p-4 dark:border-gray-700', className)} aria-hidden="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

/** Simulates a table row with 5 columns of varying widths */
export function SkeletonTableRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 py-3', className)} aria-hidden="true">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 ml-auto w-16" />
    </div>
  )
}

/** Simulates a chart block */
export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3 rounded-xl border border-gray-100 p-4 dark:border-gray-700', className)} aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
