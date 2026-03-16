import { render, screen } from '@testing-library/react'
import { BudgetOverview } from '@/presentation/components/dashboard/budget-overview'
import { describe, it, expect, vi } from 'vitest'

// Mock LucideIcon since it's a wrapper that might need complex setup
vi.mock('@/presentation/components/ui/lucide-icon', () => ({
  LucideIcon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />
}))

describe('BudgetOverview', () => {
  it('renderiza CTA "Configurar agora" quando não há orçamentos', () => {
    render(<BudgetOverview budgets={[]} />)
    expect(screen.getByText('Sem orçamentos definidos')).toBeInTheDocument()
    expect(screen.getByText('Configurar agora')).toBeInTheDocument()
  })

  it('renderiza card por categoria quando há orçamentos', () => {
    const mockBudgets = [
      {
        categoryId: '1',
        categoryName: 'Alimentação',
        categoryIcon: 'coffee',
        categoryColor: '#FF0000',
        amount: 1000,
        spent: 500,
        percentage: 50
      }
    ]
    render(<BudgetOverview budgets={mockBudgets} />)
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText(/500,00.*1\.000,00/)).toBeInTheDocument()
  })

  it('badge "Excedido" aparece quando percentage >= 100', () => {
    const mockBudgets = [
      {
        categoryId: '1',
        categoryName: 'Extra',
        categoryIcon: 'plus',
        categoryColor: '#FF0000',
        amount: 100,
        spent: 120,
        percentage: 120
      }
    ]
    render(<BudgetOverview budgets={mockBudgets} />)
    expect(screen.getByText('Excedido')).toBeInTheDocument()
    expect(screen.getByText('120%')).toHaveClass('text-danger')
  })

  it('badge "Atenção" aparece quando percentage entre 80 e 99', () => {
    const mockBudgets = [
      {
        categoryId: '1',
        categoryName: 'Test',
        categoryIcon: 'plus',
        categoryColor: '#FF0000',
        amount: 100,
        spent: 85,
        percentage: 85
      }
    ]
    render(<BudgetOverview budgets={mockBudgets} />)
    expect(screen.getByText('Atenção')).toBeInTheDocument()
    expect(screen.getByText('85%')).toHaveClass('text-warning')
  })

  it('badge "No limite" aparece quando percentage < 80', () => {
    const mockBudgets = [
      {
        categoryId: '1',
        categoryName: 'Safe',
        categoryIcon: 'plus',
        categoryColor: '#FF0000',
        amount: 100,
        spent: 70,
        percentage: 70
      }
    ]
    render(<BudgetOverview budgets={mockBudgets} />)
    expect(screen.getByText('No limite')).toBeInTheDocument()
    expect(screen.getByText('70%')).toHaveClass('text-success')
  })
})
