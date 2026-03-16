import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/presentation/components/layout/page-header'
import { describe, it, expect } from 'vitest'

describe('PageHeader', () => {
  it('renderiza título e subtítulo corretamente', () => {
    render(
      <PageHeader 
        title="Dashboard" 
        subtitle="Bem-vindo de volta" 
      />
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument()
  })

  it('renderiza slot de ações quando fornecido', () => {
    render(
      <PageHeader 
        title="Transactions" 
        subtitle="Manage your money" 
        actions={<button data-testid="test-action">Nova Transação</button>}
      />
    )
    
    expect(screen.getByTestId('test-action')).toBeInTheDocument()
    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
  })

  it('não renderiza container de ações quando o slot está vazio', () => {
    const { container } = render(
      <PageHeader 
        title="Simple" 
        subtitle="Header" 
      />
    )
    
    // The actions container is conditional: {actions && (...)}
    // It's a div with className "flex items-center gap-3"
    const actionsContainer = container.querySelector('.flex.items-center.gap-3')
    expect(actionsContainer).toBeNull()
  })
})
