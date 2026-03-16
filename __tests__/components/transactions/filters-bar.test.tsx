import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FiltersBar } from '@/presentation/components/transactions/filters-bar'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock React transitions
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()],
  }
})

describe('FiltersBar', () => {
  const mockPush = vi.fn()
  const mockReplace = vi.fn()
  const mockCategories = [
    { id: '1', name: 'Alimentação' },
    { id: '2', name: 'Lazer' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    })
    ;(useSearchParams as any).mockReturnValue(new URLSearchParams(''))
    
    // Fix system time for "current month" test
    vi.setSystemTime(new Date('2026-03-15'))
  })

  it('inicializa com o mês atual pré-selecionado se não houver na URL', () => {
    render(<FiltersBar categories={mockCategories} />)
    
    // The useEffect calls replace with ?month=2026-03
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('month=2026-03'))
  })

  it('atualiza URL ao selecionar um tipo', () => {
    render(<FiltersBar categories={mockCategories} />)
    
    const select = screen.getByLabelText('Tipo')
    fireEvent.change(select, { target: { value: 'income' } })
    
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=income'))
  })

  it('atualiza URL com debounce ao digitar na busca', async () => {
    render(<FiltersBar categories={mockCategories} />)
    
    const input = screen.getByPlaceholderText('Pesquisar por descrição...')
    fireEvent.change(input, { target: { value: 'pizza' } })
    
    // Should not call immediately
    expect(mockPush).not.toHaveBeenCalled()
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('search=pizza'))
    }, { timeout: 1000 })
  })

  it('botão Limpar aparece apenas quando algum filtro está ativo', () => {
    // No filters active
    const { rerender } = render(<FiltersBar categories={mockCategories} />)
    expect(screen.queryByText('Limpar Filtros')).not.toBeInTheDocument()
    
    // Filter active
    ;(useSearchParams as any).mockReturnValue(new URLSearchParams('search=test'))
    rerender(<FiltersBar categories={mockCategories} />)
    expect(screen.getByText('Limpar Filtros')).toBeInTheDocument()
  })

  it('botão Limpar reseta todos os filtros para a rota base', () => {
    ;(useSearchParams as any).mockReturnValue(new URLSearchParams('type=income&search=test'))
    render(<FiltersBar categories={mockCategories} />)
    
    const clearBtn = screen.getByText('Limpar Filtros')
    fireEvent.click(clearBtn)
    
    expect(mockPush).toHaveBeenCalledWith('/transactions')
  })
})
