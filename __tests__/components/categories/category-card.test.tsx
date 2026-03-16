import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryCard } from '@/presentation/components/categories/category-card'
import { describe, it, expect, vi } from 'vitest'

// Mock components used inside CategoryCard
vi.mock('@/presentation/components/ui', async () => {
  const actual = await vi.importActual('@/presentation/components/ui')
  return {
    ...actual,
    LucideIcon: ({ name }: { name: string }) => <span data-testid="lucide-icon">{name}</span>
  }
})

describe('CategoryCard', () => {
  const mockCategory = {
    id: '1',
    name: 'Alimentação',
    icon: 'utensils',
    color: '#FF0000',
    budgetLimit: 1000,
    type: 'expense' as const
  }

  const mockBudget = {
    categoryId: '1',
    limitAmount: 1000,
    spentAmount: 500,
    percentageUsed: 50,
    isExceeded: false
  }

  const defaultProps = {
    category: mockCategory,
    budget: mockBudget,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDefineBudget: vi.fn()
  }

  it('renderiza informações básicas da categoria', () => {
    render(<CategoryCard {...defaultProps} />)
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Despesa')).toBeInTheDocument()
    expect(screen.getByTestId('lucide-icon')).toHaveTextContent('utensils')
  })

  it('mostra progresso do orçamento corretamente', () => {
    render(<CategoryCard {...defaultProps} />)
    expect(screen.getByText(/500.*gastos/)).toBeInTheDocument()
    expect(screen.getByText(/Meta:.*1\.000/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('exibe badge de sucesso quando dentro do limite', () => {
    render(<CategoryCard {...defaultProps} />)
    expect(screen.getByText('Dentro do limite')).toBeInTheDocument()
  })

  it('exibe badge de atenção quando próximo ao limite (>= 85%)', () => {
    const warningBudget = { ...mockBudget, percentageUsed: 90 }
    render(<CategoryCard {...defaultProps} budget={warningBudget} />)
    expect(screen.getByText('Atenção')).toBeInTheDocument()
  })

  it('exibe badge de perigo quando excede o limite (>= 100%)', () => {
    const dangerBudget = { ...mockBudget, percentageUsed: 110 }
    render(<CategoryCard {...defaultProps} budget={dangerBudget} />)
    expect(screen.getByText('Excedido')).toBeInTheDocument()
  })

  it('mostra botão "Definir orçamento" quando não há orçamento definido', () => {
    render(<CategoryCard {...defaultProps} budget={null} category={{ ...mockCategory, budgetLimit: null }} />)
    expect(screen.getByText('Definir orçamento mensal')).toBeInTheDocument()
  })

  it('chama onDefineBudget ao clicar no botão de definir orçamento', () => {
    render(<CategoryCard {...defaultProps} budget={null} category={{ ...mockCategory, budgetLimit: null }} />)
    fireEvent.click(screen.getByText('Definir orçamento mensal'))
    expect(defaultProps.onDefineBudget).toHaveBeenCalled()
  })

  it('chama onEdit ao clicar em Editar', () => {
    render(<CategoryCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Editar'))
    expect(defaultProps.onEdit).toHaveBeenCalled()
  })

  it('chama onDelete ao clicar em Excluir', () => {
    render(<CategoryCard {...defaultProps} />)
    fireEvent.click(screen.getByText('Excluir'))
    expect(defaultProps.onDelete).toHaveBeenCalled()
  })

  it('renderiza corretamente para categoria de receita', () => {
    const incomeCategory = { ...mockCategory, type: 'income' as const }
    render(<CategoryCard {...defaultProps} category={incomeCategory} />)
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText(/500.*receitas/)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
