import { render, screen } from '@testing-library/react'
import { ProgressBar } from '@/presentation/components/ui/progress-bar'
import { describe, it, expect } from 'vitest'

describe('ProgressBar', () => {
  it('renderiza com value=0 sem erros', () => {
    render(<ProgressBar value={0} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
    expect(bar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('aplica classe verde quando value < 80', () => {
    const { container } = render(<ProgressBar value={79} />)
    const innerBar = container.querySelector('.bg-success')
    expect(innerBar).toBeInTheDocument()
  })

  it('aplica classe amarela quando value = 80', () => {
    const { container } = render(<ProgressBar value={80} />)
    const innerBar = container.querySelector('.bg-warning')
    expect(innerBar).toBeInTheDocument()
  })

  it('aplica classe amarela quando value = 99', () => {
    const { container } = render(<ProgressBar value={99} />)
    const innerBar = container.querySelector('.bg-warning')
    expect(innerBar).toBeInTheDocument()
  })

  it('aplica classe vermelha quando value = 100', () => {
    const { container } = render(<ProgressBar value={100} />)
    const innerBar = container.querySelector('.bg-danger')
    expect(innerBar).toBeInTheDocument()
  })

  it('aplica classe vermelha quando value = 150 (overflow)', () => {
    const { container } = render(<ProgressBar value={150} />)
    const innerBar = container.querySelector('.bg-danger')
    expect(innerBar).toBeInTheDocument()
  })

  it('mostra label "85%" quando showLabel=true e value=85', () => {
    render(<ProgressBar value={85} showLabel={true} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('não mostra label quando showLabel=false', () => {
    render(<ProgressBar value={85} showLabel={false} />)
    expect(screen.queryByText('85%')).not.toBeInTheDocument()
  })

  it('barra não ultrapassa 100% de largura visualmente', () => {
    const { container } = render(<ProgressBar value={150} />)
    const innerBar = container.querySelector('[style*="width: 100%"]')
    expect(innerBar).toBeInTheDocument()
  })
})
