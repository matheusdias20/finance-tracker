import { render, screen } from '@testing-library/react'
import { BalanceAreaChart } from '@/presentation/components/reports/balance-area-chart'
import { describe, it, expect, vi } from 'vitest'

// Mock Recharts to avoid DOM and SVG rendering issues in JSDOM
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts')
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="container">{children}</div>,
    AreaChart: ({ children, data }: any) => <div data-testid="chart" data-data={JSON.stringify(data)}>{children}</div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    ReferenceLine: () => <div data-testid="reference-line" />,
  }
})

describe('BalanceAreaChart', () => {
  const mockData = [
    { month: '2024-01', income: 1000, expense: 500, balance: 500 },
    { month: '2024-02', income: 1200, expense: 1500, balance: -300 }
  ]

  it('mostra mensagem quando há dados insuficientes (< 2 meses)', () => {
    render(<BalanceAreaChart data={[mockData[0]]} />)
    expect(screen.getByText(/Dados insuficientes/)).toBeInTheDocument()
  })

  it('renderiza o gráfico quando há dados suficientes (>= 2 meses)', () => {
    render(<BalanceAreaChart data={mockData} />)
    
    expect(screen.getByText('Saldo Mensal')).toBeInTheDocument()
    expect(screen.getByTestId('chart')).toBeInTheDocument()
    
    // Check if data was passed correctly to the mocked chart
    const chart = screen.getByTestId('chart')
    const passedData = JSON.parse(chart.getAttribute('data-data') || '[]')
    expect(passedData).toHaveLength(2)
    expect(passedData[0].month).toBe('2024-01')
    expect(passedData[1].balance).toBe(-300)
  })

  it('formata os meses corretamente para o gráfico', () => {
    render(<BalanceAreaChart data={mockData} />)
    
    const chart = screen.getByTestId('chart')
    const passedData = JSON.parse(chart.getAttribute('data-data') || '[]')
    
    // pt-BR locale: jan -> JAN, fev -> FEV
    expect(passedData[0].formattedMonth).toBe('JAN')
    expect(passedData[1].formattedMonth).toBe('FEV')
  })

  it('contém todos os subcomponentes necessários do recharts', () => {
    render(<BalanceAreaChart data={mockData} />)
    
    expect(screen.getByTestId('xaxis')).toBeInTheDocument()
    expect(screen.getByTestId('reference-line')).toBeInTheDocument()
    expect(screen.getByTestId('area')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })
})
