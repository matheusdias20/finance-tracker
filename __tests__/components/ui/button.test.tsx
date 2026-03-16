import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/presentation/components/ui/button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
  it('renderiza children corretamente', () => {
    render(<Button>Clique Aqui</Button>)
    expect(screen.getByText('Clique Aqui')).toBeInTheDocument()
  })

  it('chama onClick ao ser clicado', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Botão</Button>)
    fireEvent.click(screen.getByText('Botão'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando disabled=true', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Botão</Button>)
    fireEvent.click(screen.getByText('Botão'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('mostra spinner e desabilita quando loading=true', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} loading>Botão</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('aplica classes corretas para variante danger', () => {
    render(<Button variant="danger">Excluir</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-danger')
  })
  
  it('aplica classes corretas para variante secondary', () => {
    render(<Button variant="secondary">Voltar</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-primary')
    expect(button.className).toContain('border-primary')
  })
})
