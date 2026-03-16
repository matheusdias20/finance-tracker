'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine
} from 'recharts'
import { Card, CardContent } from '@/presentation/components/ui'
import { formatCurrency } from '@/presentation/lib/format'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/presentation/lib/utils'

interface EvolutionData {
  month: string
  income: number
  expense: number
  balance: number
}

interface BalanceAreaChartProps {
  data: EvolutionData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: EvolutionData; color: string; name: string }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-lg shadow-xl">
        <p className="text-sm font-bold mb-1 text-gray-900 dark:text-gray-100">
          {label ? format(parseISO(`${label}-01`), 'MMMM yyyy', { locale: ptBR }) : ''}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Saldo:</span>
          <span className={cn(
            'font-bold',
            value >= 0 ? 'text-success' : 'text-danger'
          )}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>
    )
  }
  return null
}


export function BalanceAreaChart({ data }: BalanceAreaChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    formattedMonth: format(parseISO(`${item.month}-01`), 'MMM', { locale: ptBR }).toUpperCase()
  }))

  if (!data || data.length < 2) {
    return (
      <Card className="min-h-[160px] flex items-center justify-center">
        <CardContent className="text-sm text-gray-500 text-center p-6">
          Dados insuficientes — adicione transações em pelo menos 2 meses para visualizar o saldo mensal.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="min-h-[160px]">
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Saldo Mensal</h3>
          <p className="text-xs text-gray-500">Fluxo de caixa líquido por mês.</p>
        </div>
        
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B6D11" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBalanceNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A32D2D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#A32D2D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" horizontal={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => format(parseISO(`${value}-01`), 'MMM', { locale: ptBR }).toUpperCase()}
                dy={10}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke={formattedData[formattedData.length-1]?.balance >= 0 ? "#3B6D11" : "#A32D2D"}
                fillOpacity={1} 
                fill={`url(#${formattedData[formattedData.length-1]?.balance >= 0 ? 'colorBalance' : 'colorBalanceNegative'})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
