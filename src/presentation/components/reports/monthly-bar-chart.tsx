'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts'
import { Card, CardContent } from '@/presentation/components/ui'
import { formatCurrency } from '@/presentation/lib/format'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EvolutionData {
  month: string
  income: number
  expense: number
  balance: number
}

interface MonthlyBarChartProps {
  data: EvolutionData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-lg shadow-xl">
        <p className="text-sm font-bold mb-2 text-gray-900 dark:text-gray-100">
          {label ? format(parseISO(`${label}-01`), 'MMMM yyyy', { locale: ptBR }) : ''}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}:
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    // formattedMonth is kept if needed for other logic, but XAxis will use month directly
    formattedMonth: format(parseISO(`${item.month}-01`), 'MMM', { locale: ptBR }).toUpperCase()
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-[400px] items-center justify-center text-sm text-gray-500">
          Dados insuficientes para exibir o gráfico.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Evolução Mensal</h3>
          <p className="text-xs text-gray-500">Comparativo entre receitas e despesas.</p>
        </div>
        
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => format(parseISO(`${value}-01`), 'MMM', { locale: ptBR }).toUpperCase()}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', opacity: 0.4 }} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
              />
              <Bar 
                name="Receitas" 
                dataKey="income" 
                fill="#3B6D11" 
                radius={[4, 4, 0, 0]} 
                barSize={24}
              />
              <Bar 
                name="Gastos" 
                dataKey="expense" 
                fill="#A32D2D" 
                radius={[4, 4, 0, 0]} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
