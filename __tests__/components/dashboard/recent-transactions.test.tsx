import { render, screen } from '@testing-library/react'
import { RecentTransactions } from '@/presentation/components/dashboard/recent-transactions'
import { describe, it, expect, vi } from 'vitest'

// Mock LucideIcon
vi.mock('@/presentation/components/ui/lucide-icon', () => ({
  LucideIcon: ({ name }: { name: string }) => <span data-testid="lucide-icon">{name}</span>
}))

describe('RecentTransactions', () => {
  const mockTransactions = [
    {
      id: '1',
      description: 'Mercado',
      amount: 150.50,
      type: 'EXPENSE' as const,
      date: '2024-12-01T10:00:00Z',
      categoryName: 'Alimentação',
      categoryIcon: 'shopping-cart',
      categoryColor: '#FF0000'
    },
    {
      id: '2',
      description: 'Salário',
      amount: 5000,
      type: 'INCOME' as const,
      date: '2024-12-05T09:00:00Z',
      categoryName: 'Trabalho',
      categoryIcon: 'briefcase',
      categoryColor: '#00FF00'
    }
  ]

  it('renderiza título e link corretamente', () => {
    render(<RecentTransactions transactions={[]} month="2024-12" />)
    expect(screen.getByText('Transações recentes')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ver todas/i })
    expect(link).toHaveAttribute('href', '/transactions?month=2024-12')
  })

  it('mostra mensagem quando não há transações', () => {
    render(<RecentTransactions transactions={[]} month="2024-12" />)
    expect(screen.getByText('Nenhuma transação este mês')).toBeInTheDocument()
  })

  it('renderiza lista de transações corretamente', () => {
    render(<RecentTransactions transactions={mockTransactions} month="2024-12" />)
    
    expect(screen.getByText(/Mercado/)).toBeInTheDocument()
    expect(screen.getByText(/Salário/)).toBeInTheDocument()
    
    // Check amounts with extreme flexibility
    expect(screen.getByText(/150,50/)).toBeInTheDocument()
    expect(screen.getByText(/5\.000,00/)).toBeInTheDocument()
    
    // Check categories and dates
    expect(screen.getByText(/Alimentação/)).toBeInTheDocument()
    expect(screen.getByText(/Trabalho/)).toBeInTheDocument()
    expect(screen.getByText(/01\/12/)).toBeInTheDocument()
    expect(screen.getByText(/05\/12/)).toBeInTheDocument()
  })

  it('aplica cores corretas para receitas e despesas', () => {
    render(<RecentTransactions transactions={mockTransactions} month="2024-12" />)
    
    const expenseAmount = screen.getByText(/150,50/)
    const incomeAmount = screen.getByText(/5\.000,00/)
    
    expect(expenseAmount).toHaveClass('text-danger')
    expect(incomeAmount).toHaveClass('text-success')
  })

  it('renderiza os ícones das categorias', () => {
    render(<RecentTransactions transactions={mockTransactions} month="2024-12" />)
    const icons = screen.getAllByTestId('lucide-icon')
    expect(icons).toHaveLength(2)
    expect(icons[0]).toHaveTextContent('shopping-cart')
    expect(icons[1]).toHaveTextContent('briefcase')
  })
})
