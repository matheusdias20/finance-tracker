import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MetricsSection } from '@/presentation/components/dashboard/metrics-section'

describe('MetricsSection', () => {
  const props = {
    income: 5000,
    expense: 3000,
    topCategory: { name: 'Alimentação', totalAmount: 1200 }
  }

  it('renderiza os 4 cards de métricas', () => {
    render(<MetricsSection {...props} />)
    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Gastos')).toBeInTheDocument()
    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getByText('Maior Categoria')).toBeInTheDocument()
  })

  it('calcula o saldo corretamente', () => {
    render(<MetricsSection {...props} />)
    // 5000 - 3000 = 2000
    expect(screen.getByText(/2\.000/)).toBeInTheDocument()
  })

  it('lida com topCategory nulo', () => {
    render(<MetricsSection income={100} expense={50} topCategory={null} />)
    expect(screen.getByText('Nenhuma')).toBeInTheDocument()
  })
})
