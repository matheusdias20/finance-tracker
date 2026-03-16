'use client'

import { Card, CardContent, Badge, Button } from '@/presentation/components/ui'
import { formatCurrency } from '@/presentation/lib/format'
import { Download, AlertCircle } from 'lucide-react'

interface ForecastData {
  categoryId: string
  categoryName: string
  predictedAmount: number
  minAmount: number
  maxAmount: number
  confidence: 'high' | 'medium' | 'low'
  lowConfidence: boolean
}

interface ForecastTableProps {
  data: ForecastData[]
}

export function ForecastTable({ data }: ForecastTableProps) {
  const handleExportCSV = () => {
    if (data.length === 0) return

    const headers = ['Categoria', 'Previsto', 'Minimo', 'Maximo', 'Confianca']
    const rows = data.map(item => [
      item.categoryName,
      item.predictedAmount.toFixed(2).replace('.', ','),
      item.minAmount.toFixed(2).replace('.', ','),
      item.maxAmount.toFixed(2).replace('.', ','),
      item.confidence === 'high' ? 'Alta' : item.confidence === 'medium' ? 'Media' : 'Baixa'
    ])

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `previsao-despesas-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Previsão Próximo Mês</h3>
            <p className="text-xs text-gray-500">Estimativas baseadas nos últimos 3 meses.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExportCSV} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Categoria</th>
                  <th className="px-6 py-4 font-semibold text-right">Previsto</th>
                  <th className="px-6 py-4 font-semibold text-right">Mínimo</th>
                  <th className="px-6 py-4 font-semibold text-right">Máximo</th>
                  <th className="px-6 py-4 font-semibold text-center">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((item) => (
                  <tr key={item.categoryId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2">
                       {item.categoryName}
                       {item.lowConfidence && (
                         <div title="Poucos dados históricos para uma previsão precisa." className="cursor-help">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.predictedAmount)}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(item.minAmount)}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(item.maxAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={item.confidence === 'high' ? 'success' : item.confidence === 'medium' ? 'warning' : 'danger'}>
                        {item.confidence === 'high' ? 'Alta' : item.confidence === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            Adicione transações por pelo menos 1 mês para ver previsões.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
