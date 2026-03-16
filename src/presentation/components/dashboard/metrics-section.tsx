'use client'

import { MetricCard } from '@/presentation/components/ui/metric-card'

interface MetricsSectionProps {
  income: number
  expense: number
  topCategory: {
    name: string
    totalAmount: number
  } | null
}

export function MetricsSection({ income, expense, topCategory }: MetricsSectionProps) {
  const balance = income - expense

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Receitas"
        value={income}
        prefix="R$"
        variant="default"
      />
      <MetricCard
        label="Gastos"
        value={expense}
        prefix="R$"
        variant={expense > income ? 'danger' : 'default'}
      />
      <MetricCard
        label="Saldo"
        value={balance}
        prefix="R$"
        variant={balance < 0 ? 'danger' : 'default'}
      />
      <MetricCard
        label="Maior Categoria"
        value={topCategory?.totalAmount ?? 0}
        prefix="R$"
        trendLabel={topCategory?.name ?? 'Nenhuma'}
        variant="default"
      />
    </div>
  )
}
