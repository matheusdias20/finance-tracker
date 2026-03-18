import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { DashboardHeader } from '@/presentation/components/dashboard/dashboard-header'
import { Providers as AppStateProvider } from '@/presentation/providers'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams('month=2024-12'),
}))

describe('DashboardHeader', () => {
  it('renderiza título e subtítulo', () => {
    render(
      <AppStateProvider>
        <DashboardHeader />
      </AppStateProvider>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Acompanhe sua saúde financeira')).toBeInTheDocument()
  })

  it('navega para o mês anterior', () => {
    render(
      <AppStateProvider>
        <DashboardHeader />
      </AppStateProvider>
    )
    const prevBtn = screen.getByLabelText('Mês anterior')
    fireEvent.click(prevBtn)
    expect(mockPush).toHaveBeenCalledWith('?month=2024-11')
  })

  it('navega para o próximo mês', () => {
    render(
      <AppStateProvider>
        <DashboardHeader />
      </AppStateProvider>
    )
    const nextBtn = screen.getByLabelText('Próximo mês')
    fireEvent.click(nextBtn)
    expect(mockPush).toHaveBeenCalledWith('?month=2025-01')
  })
})
