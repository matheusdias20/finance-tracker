import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/presentation/components/ui/metric-card'
import { describe, it, expect } from 'vitest'

describe('MetricCard', () => {
  it('renderiza label e valor corretamente', () => {
    render(<MetricCard label="Total Ganho" value={1000} />)
    expect(screen.getByText('Total Ganho')).toBeInTheDocument()
    // Use regex to match 1.000 (pt-BR format)
    expect(screen.getByText(/1\.000/)).toBeInTheDocument()
  })

  it('formata valor numérico como BRL quando prefix="R$"', () => {
    render(<MetricCard label="Saldo" value={1234.56} prefix="R$" />)
    // formatCurrency might produce non-breaking spaces, so we check content
    const valueElement = screen.getByText(/1\.234,56/)
    expect(valueElement).toBeInTheDocument()
    expect(valueElement.textContent).toContain('R$')
  })

  it('mostra seta trend positivo quando trend > 0', () => {
    const { container } = render(<MetricCard label="Test" value={100} trend={15} />)
    // Flexible match for "+ 15%" or "+15,0%" depending on environment/implementation
    expect(screen.getByText(/\+\s*15/)).toBeInTheDocument()
    // TrendingUp icon class check (simplified since lucide components might be harder to query directly)
    const icon = container.querySelector('.text-success')
    expect(icon).toBeInTheDocument()
  })

  it('mostra seta trend negativo quando trend < 0', () => {
    render(<MetricCard label="Test" value={100} trend={-10} />)
    expect(screen.getByText(/\-\s*10/)).toBeInTheDocument()
    expect(document.querySelector('.text-danger')).toBeInTheDocument()
  })

  it('não mostra trend quando trend=null', () => {
    render(<MetricCard label="Test" value={100} trend={null} />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('aplica classes de variant="danger" corretamente', () => {
    const { container } = render(<MetricCard label="Divida" value={-500} variant="danger" />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-danger')
    const value = screen.getByText('-500')
    expect(value.className).toContain('text-danger')
  })
})
